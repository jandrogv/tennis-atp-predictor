# Auditoría temporal y transición del modelo

Revisión: 30/09/2026. El modelo activo sigue en `notebook_legacy`; no se ha
entrenado ni sustituido durante esta auditoría. La mensual ejecutada por el usuario
terminó el 28/09 a las 20:25.

## Hallazgos y correcciones

- `ELO_DIFF` y `ELO_SURFACE_DIFF` heredados incorporan el resultado del partido.
  Es una fuga demostrada. Las seis entradas Elo previas se usan en modo estricto,
  y las dos posteriores se excluyen.
- El holdout heredado se usa para seleccionar candidatos y para informar métricas.
  La implementación estricta separa selección y prueba final.
- Los partidos pendientes podían actualizar el historial al perder `source_split`.
  Ahora solo leen estado y carecen de objetivo observado en modo estricto.
- Un resultado nocturno puede estar disponible al día siguiente de su inicio.
  [ATP documenta Zverev–Sonego terminando a la 1:55 del miércoles](https://www.atptour.com/en/news/sonego-zverev-us-open-2026-r1).
  La actualización del historial y los cortes de entrenamiento necesitan ambas fechas.
- Si faltaba un ranking anterior al torneo, el cargador elegía el más antiguo aunque
  fuera posterior. Ahora omite esa asignación y explica por qué.
- La edad se calculaba al día de la recarga. El cargador usa ahora la fecha del
  partido cuando existe; su alternativa heredada de inicio del torneo no se marca
  como fecha verificada del partido.
- Los días locales de torneos en zonas horarias diferentes no garantizan un orden
  causal global. El contrato estricto exige ahora una base UTC común para inicio,
  disponibilidad del resultado, ranking y contexto; no convierte fechas locales
  sin información suficiente.

## Contrato opcional `strict-pre-match-v3`

V3 añade la base UTC obligatoria al contrato V2, que incorporó la disponibilidad
de resultados nocturnos ausente en V1. Los artefactos V1 y V2 no se aceptan como V3. El actualizador
mantiene su modo heredado; no se ha activado un reemplazo del modelo.

Entradas necesarias:

| Campo | Significado |
| --- | --- |
| `temporal_date_basis` | Debe ser `UTC` en cada fila: las cuatro familias de fechas representan días UTC contrastados |
| `match_date`, `match_date_verified` | Día ISO de inicio del partido, contrastado a nivel de partido |
| `result_available_date`, `result_available_date_verified` | Día en que el resultado estuvo disponible; obligatorio para partidos observados, vacío para predicción |
| `ranking_date`, `ranking_date_verified` | Snapshot contrastado del que proceden ranking y puntos |
| `player_context_available_date`, `player_context_available_date_verified` | Disponibilidad contrastada del contexto de ambos jugadores, incluidos edad y altura |
| `source_split` | Entrenamiento, periodo posterior o predicción; esta última nunca escribe historial |

Los indicadores son declaraciones de verificación, no pruebas por sí solos.
Hay que conservar las fuentes y contrastar los valores. El código no convierte
fechas de torneo, datos actuales del catálogo o rankings sin procedencia en
información histórica verificada. Tampoco basta añadir `UTC` a una fecha local:
la declaración exige evidencia de su conversión o del día UTC original.

Con días UTC y sin horas fiables, todos los partidos de un día leen antes de aplicar
los resultados disponibles ese día. Un partido iniciado el lunes y terminado el
martes afecta al historial a partir del miércoles. No se descarta ese partido ni
se impone un retraso fijo a todos: se utiliza su disponibilidad individual.
Rankings y contexto deben proceder de un día anterior. Incorporar publicaciones
del mismo día requiere ampliar el contrato a timestamps contrastados.

H2H, forma, estadísticas previas, partidos jugados, Elo y sus gradientes siguen
los mismos eventos. Las predicciones nunca actualizan estado. La orientación
tiene semilla reproducible. Los metadatos quedan fuera de las entradas numéricas.

## Entrenamiento y evaluación separados

Se requieren archivos explícitos de entrenamiento y periodo posterior, con
contratos y columnas iguales. Todas las fechas de inicio de entrenamiento
preceden al periodo posterior. Se excluyen del ajuste las etiquetas cuyo resultado
aún no estaba disponible al empezar dicho periodo.

Aproximadamente el primer 60 % de días posteriores se reserva para selección y
el último 40 % para evaluación final. No se divide un día entre ambos. Las etiquetas
de selección que cruzan el inicio final se excluyen de la selección.

La validación cruzada es expansiva por días. Calibración y validación interna
usan periodos posteriores dentro del entrenamiento y excluyen etiquetas aún no
disponibles en sus límites. No se mezclan aleatoriamente periodos ni se reutilizan
parámetros de un registro anterior que pudiera haber consultado el test final.

El índice conserva inicio y disponibilidad juntos a través de todos los cortes.
El manifiesto registra la base UTC, límites, filas excluidas y huella de variables, objetivos,
inicios y disponibilidad de la prueba final. La evaluación rechaza cambios y solo
admite el modelo seleccionado, sin `evaluate_all`. Predicción y evaluación exigen
artefactos compatibles. Esto no impide decisiones humanas posteriores basadas en
un test ya consultado.

## Cobertura real y transición pendiente

La fuente anual local de 2026 tiene 2.952 filas sin fecha individual verificada.
Los 24 Excel de torneo y dos CSV de resultados/próximos partidos revisados tampoco aportan ese dato. La página de resultados
de Brisbane contiene 49 partidos pero no fechas individuales en los campos revisados.
No se deducen por ronda ni se vuelven a descargar torneos completos para esta auditoría.

Hay 45 correcciones trazables en `data/processed/match_date_corrections.csv`.
Se revisaron las 32 finales que quedaban en la lista prioritaria y se contrastaron
28. Roma (semifinal) y Eastbourne (final) empezaron un día y concluyeron al siguiente;
su evidencia separa inicio y disponibilidad. Cuatro finales siguen sin fecha
certificada por walkover, fuentes contradictorias o falta de resultado fechado.
El [informe de fechas](auditoria-fechas-partidos-2026-09-30.md) detalla fuentes y fechas.
Estas correcciones de presentación no rellenan las fechas de inicio, disponibilidad
y contexto de toda la población de entrenamiento. Tampoco establecen por sí solas
los días UTC necesarios para entrenar V3.

Para la transición manual, preparar entradas verificadas y generar variables con
`strict_temporal=True`. Usar directorios nuevos en `data/processed` y `models`,
sin sobrescribir el modelo activo. `train --mode strict` requiere `--train-file`
y `--test-file`; `evaluate` usa el manifiesto y el periodo posterior original para
evaluar exclusivamente la partición final. Comparar resultados y contratos antes
de activar un modelo nuevo. No se afirma una mejora sin evaluación real.

## Validación y publicación

La suite Python pasa 178 pruebas. Incluye conservación del marcador `n/a` al
aplicar fechas a partidos sin estadísticas, rechazos de bases horarias locales o
ausentes, conservación de UTC al cargar CSV y exclusión de artefactos V2, además
de contrafactuales del mismo día, resultados
nocturnos, predicciones que no escriben estado, rankings/contexto posteriores,
etiquetas tardías excluidas en cortes, huella final y homónimos. Los candidatos de
la prueba de selección son simulados: no se ha entrenado XGBoost ni TensorFlow.

```powershell
$env:PYTHONPATH = "src"
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m compileall -q src tests
```

La web etiqueta las métricas heredadas y explica los Elo posteriores. El bloque
`0498a20` está publicado en GitHub y Vercel. QA de `/model` y `/feature-importance`
en Chrome a 1440×1000 y 390×844 confirmó el aviso, el filtro Elo y ausencia de errores
de consola. Se usó Playwright porque no está disponible la skill Browser.
La suite web pasa 63 pruebas; la compilación Next.js 16.3.6 es correcta.

Se regeneraron 31 derivados y su copia pública local, incorporando las primeras 17
fechas y las 76 identidades contrastadas. La caché por fecha de ranking ahora
compara su contenido con la fuente: propaga correcciones y conserva archivos
inalterados. También se normalizan las etiquetas de ronda en perfiles.
QA local recorrió 31 rutas con filtros, comparador, detalles, modal y móvil sin
errores de consola. El verificador pasó; mantiene cuatro avisos no críticos:
un experimento histórico con enlaces fuera de las predicciones actuales y tres
eventos de equipos sin campeón individual. El primer despliegue recibió el aviso
sin los datos renovados. El 30/09 el usuario autorizó incluir también los archivos
públicos de `web/public/data/` en `main`; esta entrega incorpora esas exportaciones.

La ampliación posterior a 45 fechas regeneró cinco derivados de partidos y
perfiles, su manifiesto y las particiones web afectadas. Se verificaron 51 visitas,
seis en móvil, sin errores ni desbordamientos. Conserva balances, los 227 marcadores
sin estadísticas, los 122 archivos raw y la huella del modelo. Los otros 2.907 días
de partido siguen sin contrastar; esta cobertura parcial no habilita entrenamiento V3.

La exportación mensual local había copiado rutas personales del modelo a un CSV
público. El exportador ahora admite solo columnas de métricas públicas y se limpió
la copia generada. El modelo y las métricas privadas permanecen intactos.

Código Python, exportadores y pruebas privados permanecen locales según las
exclusiones Git. La autorización de publicación se limita a las exportaciones
públicas de la web: no incluye raw, derivados de trabajo, modelos ni evidencia
detallada ATP. Los informes están en `data/processed/audit-2026-09-29`. La única edición manual
de raw fue la ampliación del catálogo expresamente autorizada: 76 altas y cuatro
nacimientos, con respaldo íntegro. No se modificaron las fuentes históricas de partidos.
Para revertir, conservar el modelo heredado y no activar `strict`; el aviso web se
puede revertir independientemente sin alterar datos ni modelos.

Referencia metodológica: [validación temporal de scikit-learn](https://sklearn.org/stable/modules/cross_validation.html#time-series-split).


## Verificación del 02/10/2026 y preparación manual

El modelo operativo sigue siendo el entrenado en la mensual del usuario del
28/09/2026 (finalizada 20:25:18), con metodología `notebook_legacy`. No es un
modelo antiguo por falta de recarga: lo heredado es su contrato metodológico.
Esta revisión no vuelve a entrenar ni activa V3. La cobertura actual de presentación
es 47 fechas únicas y 2.905 pendientes; las 28 de la ampliación no se suman dos veces.

| Familia / flujo | Fuente y garantía comprobada | Límite |
| --- | --- | --- |
| Ranking y puntos | Campos del partido más snapshot anterior contrastado; se rechaza fecha futura, ausente o no verificada | La declaración necesita procedencia real del snapshot |
| Edad, altura y tamaño del cuadro | Contexto suministrado para el partido; disponibilidad verificada anterior exigida | El código no reconstruye por sí solo datos históricos faltantes |
| H2H, partidos jugados, forma y estadísticas | Consultan el historial antes de escribir resultados disponibles; las predicciones solo leen | Días UTC, no resolución intradía |
| Elo general/superficie y gradientes | Consultan estado previo por los mismos eventos; se excluyen los dos Elo posteriores del contrato estricto | El modelo operativo heredado sigue admitiendo esos dos Elo posteriores |
| Cortes y calibración | Días completos, orden temporal y purga individual de etiquetas tardías | No acredita calidad predictiva sin entrenamiento real |
| Selección y evaluación | Selección anterior, prueba final posterior con huella de datos; candidatos no reciben el periodo final | Las decisiones humanas después de consultar resultados pueden contaminar una evaluación futura |
| Predicción y artefactos | Comparación exacta con `strict-pre-match-v3`; bases locales/ausentes y V1/V2 rechazados | No convertir un artefacto heredado cambiando solo su etiqueta |
| Caché de rankings | Comparación con la fuente antes de reutilizar; correcciones invalidan, archivos idénticos conservan fecha de modificación | Se ha probado con fixtures y contrastado con fuente local |

No se encontró otro defecto reproducible en V3 que requiera modificar el código.
La suite actual pasa **183 pruebas Python**, incluidas causalidad del mismo día,
resultados nocturnos, purgas, artefactos, disponibilidad de contexto y conservación
de UTC desde CSV. Hay **65 pruebas web**; se incluyen invalidación y conservación
de snapshots. Estas pruebas utilizan muestras/fixtures y candidatos simulados,
no constituyen entrenamiento ni una evaluación nueva del modelo activo.

Pasos manuales, pendientes de entradas verificadas:

1. Preparar en un directorio nuevo el dataset completo con todas las columnas
   del contrato, fuentes y días UTC contrastados; no rellenar flags por conveniencia.
2. Generar variables en modo estricto sobre el historial unido, para que el periodo
   posterior pueda leer el pasado. Por ejemplo, cuando exista
   `data/processed/strict-input/final_dataset.csv`:

   ```powershell
   $env:PYTHONPATH = "src"
   .\.venv\Scripts\python.exe -m tennis_pipeline.pipeline features --mode strict --input-dir data/processed/strict-input --output-dir data/processed/strict-v3-features
   ```

   No añadir `--current-year` en este ejemplo: esa ruta vuelve a leer los archivos
   anuales raw, que aún carecen de la procedencia temporal requerida.
3. Separar las variables generadas por días completos en `train.csv` y
   `later-period.csv`, conservar límites y huellas, y entrenar en **otro directorio**:

   ```powershell
   .\.venv\Scripts\python.exe -m tennis_pipeline.pipeline train --mode strict --train-file data/processed/strict-v3-features/train.csv --test-file data/processed/strict-v3-features/later-period.csv --model-dir models/strict-v3-candidate
   .\.venv\Scripts\python.exe -m tennis_pipeline.pipeline evaluate --test-file data/processed/strict-v3-features/later-period.csv --model-dir models/strict-v3-candidate --output-dir data/processed/strict-v3-evaluation
   ```

4. Revisar manifiesto, exclusiones, purgas y evaluación final reservada. Comparar
   metodologías y métricas en condiciones equivalentes antes de decidir una activación.
   La app mensual mantiene su contrato heredado; pulsar Mensual no activa V3.

Los comandos anteriores están documentados para una ejecución posterior y **no se
han ejecutado**. La activación seguirá siendo una decisión manual separada.

## Cobertura medida en la nueva fase de datos del 02/10

Se examinaron **42 archivos anuales (1985–2026)** con **135.455 filas** y
**135.453 claves distintas** por edición, ganador, perdedor, ronda y marcador,
normalizadas con utilidades existentes. `atp_matches_test.csv` queda fuera del
inventario anual histórico. Dos claves repetidas corresponden a Davis Cup de 2024
(Austria–Turquía) y 2025 (El Salvador–Rumanía), con los mismos participantes y
marcador y diferente `match_num` (2/3). Se documentan sin eliminar filas raw.

| Evidencia / requisito | Cobertura constatada |
| --- | --- |
| Día local de presentación en 2026 | 53/2.952 partidos únicos; 2.899 pendientes |
| Inicio y conclusión con hora y zona contrastadas | 1 partido: Shelton–Alcaraz, US Open QF; precisión de minuto |
| Día UTC de inicio que pasa su validador | 1/2.952, en evidencia aislada |
| Disponibilidad original del resultado/estadísticas acreditada | 0 |
| Disponibilidad anterior verificada de ranking y contexto | 0 |
| Elegibles V3 en la evidencia ampliada de 2026 | **0/2.952**, evaluados individualmente |
| Elegibles en fuentes anuales actuales | **0/135.455 filas**: faltan metadatos temporales requeridos |

V3 exige **días UTC**, no orden intradía ni timestamps completos obligatorios en
todas las filas. Se reutilizan `verified_match_dates`,
`verified_result_available_dates` y `validate_prematch_context_dates`. El único
inicio UTC acreditado pasa su validador específico, pero falla disponibilidad de
resultado. Las otras 2.951 filas fallan por base UTC no acreditada. Ranking y contexto
requieren días verificados estrictamente anteriores; disponer de sus valores o de
30 etiquetas semanales de snapshot no acredita su publicación histórica.

Un encabezado de crónica puede preceder a revisiones posteriores. Ni ese encabezado
solo, ni la fecha de consulta, ni el `mtime` demuestran cuándo estuvo disponible
originalmente el registro consumido. El último punto prueba conclusión, separada
de disponibilidad verificable del resultado y estadísticas.

El cero medido **no depende de completar los 2.899 días locales restantes**. Un
subconjunto futuro puede ser elegible si aporta todos los requisitos; su suficiencia
para entrenar exige además justificar cobertura histórica, tamaño, clases,
superficies y cortes temporales. No se generan variables, entrena, calibra,
evalúa ni activa un modelo. Se mantiene `notebook_legacy` de la mensual del 28/09.
Los rechazos de bases locales y artefactos V1/V2 siguen probados: 183 tests Python.

Inventario, rechazos y fuentes: `data/processed/audit-2026-10-02-data-phase/v3-readiness.json`.
Cobertura por partido: `v3-current-year-coverage.csv`, solo auditoría, nunca entrada
del modelo operativo. Siguiente bloque útil: versiones históricas trazables de
resultados/estadísticas, rankings y contexto de un grupo acotado, antes de preparar
entrenamiento o ampliar indiscriminadamente fechas.

## Piloto histórico acotado: 3 de octubre de 2026

Se examinaron los cuatro cuartos, las dos semifinales y la final del US Open 2026:
**7 objetivos, 8 identidades inequívocas, 0 elegibles y 7 rechazados**. La investigación
del piloto queda documentada; la preparación de datos V3 continúa abierta. No se
generaron variables de estos partidos ni se entrenó, calibró o activó un modelo.
La elección parte del inicio acreditado de Shelton–Alcaraz y permite estudiar una
cadena de rondas de una misma edición. No acredita representatividad para entrenar.

### Corte, etiquetas y estados según el código actual

El corte de variables es **00:00 del día UTC de inicio**, no la hora real del primer
punto. Se inspeccionaron el constructor y validadores de `features.py`, su carga
por temporadas, `preprocessing.py`, los consumidores de entrenamiento/predicción,
los normalizadores de estadísticas y las dos funciones de extracción de ATP.

- Ranking y contexto deben tener una versión acreditada disponible en un día UTC
  estrictamente anterior. La fecha efectiva del ranking no prueba su disponibilidad.
- El resultado observado puede conocerse después del inicio. El validador acepta
  una fecha posterior, incluida una **cota conservadora de observación**; no exige
  demostrar la primera publicación. Esa cota nunca se retrotrae al final del partido.
- Cada día se leen todas las variables antes de escribir los resultados disponibles
  ese día. El mismo mecanismo gobierna H2H, superficie, partidos jugados, forma,
  estadísticas, Elo y gradientes. Las filas de predicción no escriben estado.
- Dentro de un día de disponibilidad, las escrituras conservan el orden estable de
  entrada, previamente ordenado por día de inicio e IDs. No se afirma orden intradía
  real. Una corrección o captura tardía cambia cuándo se permite usar esa versión.
- La disponibilidad del resultado gobierna también la incorporación de sus
  estadísticas. Para esa escritura debe estar acreditada la versión del paquete
  consumido; una noticia con el ganador no demuestra el paquete completo.
- Los indicadores y las comprobaciones de fechas no certifican por sí solos la
  calidad de los valores, la fuente o la integridad del historial.

### Evidencia de inicio y alcance de las cotas

| Objetivo | Inicio acreditado para V3 | Resultado del piloto |
| --- | --- | --- |
| Shelton–Alcaraz, QF | 09/09 UTC; 03:05, precisión de minuto | Rechazado por ranking, contexto, historial y calidad de estadísticas |
| Tiafoe–Michelsen, QF | 08/09 UTC, por intervalo; sin hora exacta | Mismos bloqueos |
| Zverev–Van de Zandschulp, QF | Noche del 09/09 local; día UTC pendiente | También falta inicio UTC |
| Khachanov–Blockx, QF | 09/09 local; día UTC pendiente | También falta inicio UTC |
| Zverev–Khachanov, SF | Tarde del 11/09 local, evidencia cualitativa conservada | También falta un intervalo cuantitativo UTC certificado |
| Shelton–Tiafoe, SF | Noche del 11/09 local; día UTC pendiente | También falta inicio UTC |
| Zverev–Shelton, F | 13/09 local; día UTC pendiente | También falta inicio UTC |

La [cronología oficial de Arthur Ashe](https://www.usopen.org/amp/en_US/news/articles/2026-09-09/us_open_2026_is_terrific_tuesday_the_new_super_saturday.html)
identifica el comienzo de Shelton–Alcaraz a las 23:05 locales del 8 y el final a las
03:33 del 9. EDT corresponde a UTC−4 durante ese periodo, conforme a la
[tabla de NIST](https://www.nist.gov/pml/time-and-frequency-division/local-time-faqs)
y sus [reglas de horario de verano](https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst).
Se conserva la precisión de minuto: inicio 09/09 03:05 UTC y final 09/09 07:33 UTC.

Para Tiafoe–Michelsen se combina esa secuencia real de partidos con la
[crónica individual](https://www.usopen.org/amp/en_US/news/articles/2026-09-08/frances_tiafoe_vs_alex_michelsen_at_the_2026_us_open.html),
que acredita el martes local y una duración de 4 h 39 min. El inicio local del
martes establece una cota inferior de 08/09 04:00 UTC. El partido terminó antes
del comienzo real de Shelton; utilizando solo la cota de duración de más de cuatro
horas y un minuto de margen para la precisión del reloj, su inicio es anterior a
08/09 23:06 UTC. Todo ese intervalo pertenece al mismo día UTC. **Es una inferencia
por cotas, no una hora inventada**; `verified_match_dates` admite el día contrastado.
No se usa un horario previsto, un encabezado editorial o una fecha de rastreo como
hora real ni como prueba de una versión histórica.

Las siete filas locales y sus valores se observaron, con huellas de contenido,
a más tardar el **03/10/2026 09:36:36 UTC**. Los dos objetivos con inicio UTC pasan
el validador de disponibilidad usando el 03/10 como cota tardía. Esto verifica
solamente la admisibilidad de la fecha de observación para la etiqueta; no valida
las estadísticas ni demuestra disponibilidad durante septiembre. Los otros cinco
no se prueban como paquetes V3 sin inicio UTC. Usar esta cota para resultados
de septiembre no permite escribirlos en el historial de otra predicción de septiembre.
Las versiones de ranking y contexto observadas en octubre tampoco pasan el corte.

### Historial y calidad que impiden generar variables

Se trazaron **6.150 referencias para los siete objetivos, correspondientes a 2.918
filas distintas de historial directo**. En esa población no hay claves de partido
duplicadas ni IDs de jugador ausentes/no únicos en el catálogo. Son candidatos
agrupados por temporada, comienzo de torneo y rondas anteriores; esos criterios
no se convierten en días UTC ni disponibilidad verificados.

H2H y número de partidos necesitan los eventos anteriores de cada pareja/jugador.
Forma llega a 100 partidos; estadísticas de saque, a 2.000; gradientes de Elo, a
250 estados. Elo general y por superficie dependen además de los estados previos
de los rivales. La clausura del grafo de candidatos alcanza **135.200 filas y 4.418
jugadores**: es una cota estructural sin orden temporal, **no el mínimo historial
causal que necesariamente habría que recuperar**. No se calculó Elo con ese grafo.

El constructor inicializa Elo/superficie a 1.500 y los contadores a cero en el
principio de la entrada; no carga checkpoints. La fuente local empieza en 1985.
Un recorte a los siete partidos reiniciaría el estado y cambiaría el significado
de las variables. No se hizo. Falta un historial admisible con frontera inicial
declarada, o un estado inicial V3 auditado cuya importación habría que diseñar y
validar en otra fase. El constructor exige también los metadatos de contexto de
cada fila histórica suministrada, aunque sus estadísticas se consuman más tarde.

Además de la procedencia temporal, se encontraron estos bloqueos de valores:

- **Seis discrepancias** de posición/puntos en cuatro objetivos frente a la copia
  fechada 31/08: Michelsen 45 frente a 46; Van de Zandschulp 71/834 frente a 70/868;
  Khachanov 49 frente a 50 en dos partidos; Blockx 32 frente a 34. No se eligió una
  versión como correcta sin procedencia previa al corte ni se corrigió raw.
- **Los siete objetivos fallan las comprobaciones de conteos** de
  `normalize_service_statistics`. Por ejemplo, Shelton–Alcaraz contiene
  `w_svpt=109`, `w_1stIn=174`, `l_svpt=102` y `l_1stIn=157`; los primeros servicios
  dentro no pueden superar todos los puntos al servicio. Las columnas rellenas no
  constituyen un paquete estadístico válido.
- Se verificó un defecto del mapeo actual: `parse_match_stats` y `parse_match_stats2`
  asignan el numerador de **Service Points Won** a `w_svpt/l_svpt`, mientras que
  los consumidores esperan el total de puntos al servicio, denominador de esa
  fracción. No se atribuyen todas las anomalías de estas filas a ese único defecto
  sin sus respuestas HTML originales. Se registra como corrección necesaria antes
  de una futura captura; no se cambia scraping ni se redescargan partidos en esta fase.
- De las 2.918 filas directas, **49 tienen estadísticas ausentes y 59 tienen algún
  valor obligatorio ausente**. No se eliminaron para fabricar un historial completo.
- La crónica conjunta de semifinales presenta 6-2 en el primer set de Zverev;
  el informe individual y el registro local indican 6-3. No se mezclaron versiones.

### Fuentes comprobadas y decisión acotada

Se reutilizaron el catálogo, la copia de ranking, los archivos anuales y los hechos
documentados el 02/10. Se contrastaron las crónicas oficiales individuales y la
cronología real de Arthur Ashe. Las versiones actuales acreditan hechos que narran;
sus encabezados no fijan cuándo existía el contenido íntegro que hoy se consulta.

La estrategia nueva de archivos históricos consultó la API de disponibilidad de
Internet Archive para la URL exacta del ranking 31/08, antes del primer objetivo,
y las estadísticas ATP `2026/560/ms007`, antes de semifinales. Ambas respuestas
fueron HTTP 200 con `archived_snapshots` vacío. **No prueba inexistencia global de
capturas bajo otras URLs.** Se conservan consultas, respuestas, fecha UTC y SHA-256.
Las notas ATP devolvieron 403; no se eludió el bloqueo. Una búsqueda acotada de notas
prematch no produjo una versión histórica completa certificada.

Se consideró Indian Wells 2026 como alternativa por sus notas oficiales indexadas:
el PDF consultado redirige a `/404` y la evidencia existente de su final solo
contrasta el día local. Roma/Eastbourne aportan límites nocturnos locales, pero no
versiones de ranking, contexto y estadísticas disponibles para sus variables.
Ningún grupo considerado mejora conjuntamente los requisitos del piloto. No se
abrió otra campaña general de identidades o fechas.

### Propuesta de captura futura, sin implementación ni programación

| Datos/fuente | Momento y prueba necesarios | Conservación propuesta |
| --- | --- | --- |
| Ranking oficial ATP fechado | Captura previa al corte UTC; conservar la última versión ya conocida. La nueva publicación del mismo día no entra en V3 diario | Fecha efectiva separada de observación, contenido exacto y su huella |
| Perfil ATP y contexto de torneo/draw oficial | Versión de DOB, altura, superficie y tamaño del cuadro conocida antes de 00:00 UTC; registrar correcciones como nuevas versiones | IDs, valores, localizador y versión, sin reescribir evidencias anteriores |
| Inicio/final reales del centro oficial del torneo o feed oficial | Hora efectiva si la fuente la aporta; en otro caso, intervalo de observaciones justificadas. Admitir día solo si todo el intervalo cae en un único día UTC | Hora original, zona, UTC, precisión y fundamento; horario previsto separado |
| Resultado y estadísticas oficiales completas | Captura tras finalizar, con valores coherentes y esquema verificado; reintento razonable si falta contenido. Usar su observación como cota conocida, sin retrotraer publicación | Ganador/score separados del paquete de estadísticas; conservar cada revisión |
| Cada respuesta/captura | Registrar petición y recepción UTC, URL, estado HTTP, localizador, contenido o referencia inmutable y SHA-256; fecha declarada del proveedor separada | Evidencia privada bajo `data/processed/temporal/`, utilizando CSV/JSON y manifiestos existentes |
| Estado de variables | Reconstruir desde historial certificado y frontera declarada, o especificar un checkpoint V3 verificable antes de usarlo | Versión del código, configuración, orden de eventos, linaje del estado y dependencias |

La captura futura es necesaria pero **no recupera por sí sola el historial anterior**.
El mapeo de conteos quedó corregido en la revisión descrita más abajo. Esta
propuesta permanece sin implementar ni programar, con los siguientes requisitos.

#### Flujo manual y conservación de versiones

La integración prevista reutiliza la ejecución manual diaria/mensual y el lock
existente: un paso explícito de captura guarda evidencia antes de transformar
datos. Su primera implementación escribirá únicamente en un destino nuevo bajo
`data/processed/temporal/`, sin activar predicciones ni sustituir raw. CSV/JSON y
los manifiestos existentes bastan; no se propone un servicio ni una dependencia.

1. Antes del corte de una futura observación objetivo, capturar ranking ATP,
   perfiles y contexto oficial del torneo/cuadro. Con V3 diario, la recepción debe
   ser **anterior a 00:00 UTC del día real del partido**. Una descarga durante ese
   día no vale aunque preceda al comienzo del encuentro. Guardar las entradas
   concretas seleccionadas y referencias a sus versiones antes de cualquier
   predicción; no seleccionar posteriormente la versión más reciente.
2. Conservar cada respuesta exacta, URL y parámetros sin secretos, petición y
   recepción UTC, estado HTTP, tipo de contenido, localizador del bloque y SHA-256.
   Registrar IDs de partido/jugadores y cobertura: partido completo, parcial o set.
   Mantener esquema, versión de extractor y contrato estadístico junto a valores,
   unidades, numeradores/denominadores y procedencia de derivaciones. Cabeceras
   seguras como ETag pueden ayudar; cookies y cabeceras de autenticación no forman
   parte de los manifiestos. La evidencia completa queda privada e ignorada por Git.
3. Separar `event_at` real, `published_at` cuando una fuente lo acredita y
   `observed_at` de recepción. Una fecha editorial o Last-Modified no certifica
   por sí sola la primera publicación de todo el contenido. Conservar zona,
   precisión y cotas; nunca convertir horario previsto en inicio real verificado.
   La planificación de un encuentro futuro queda como tal, hasta contrastar su
   evento real; la primera captura no habilita automáticamente predicciones V3.
4. Después del partido, capturar por separado resultado y paquete estadístico.
   Cada corrección crea una versión nueva con su propia observación; no modifica
   la anterior ni se aplica retrospectivamente a cortes anteriores. En el
   constructor V3 actual hay una sola fecha de disponibilidad para el evento:
   usar como cota conservadora el día más tardío de resultado y componentes
   estadísticos consumidos. Adelantar Elo/H2H y retrasar solo estadísticas exigiría
   diseñar y aprobar otra semántica de eventos; no se implementa en esta fase.
5. Guardar manifiestos de intentos fallidos y su clasificación: bloqueo HTTP,
   navegación fallida, estadísticas oficialmente vacías, identidad ambigua o
   conteos contradictorios. Un 403 permanece pendiente, sin eludirlo; no equivale
   a un partido sin estadísticas. Mantener pausas/cierre de Chrome y reintentos
   acotados existentes. Reintentos posteriores serán manuales y únicamente sobre
   registros pendientes; una nueva respuesta recibida tarde conserva esa demora.
6. Distinguir repetición de captura de contenido repetido: registrar las dos
   observaciones aunque compartan huella. Deduplicar contenido por SHA-256, no
   eliminar partidos ni observaciones. La clave incluye torneo/temporada, ID
   oficial de partido y jugadores, sin unir silenciosamente identidades ambiguas.

#### Primera captura: criterios de aceptación

- Reproducir fuera de línea la lectura con la respuesta congelada y obtener los
  mismos valores/huellas, sin nuevas consultas ni sobrescrituras.
- Resolver inequívocamente IDs y cobertura del contexto previo al partido. Para
  resultados y estadísticas posteriores, acreditar además orientación
  ganador/perdedor y validar cantidades, porcentajes, ausencias y el contrato
  `atp-service-counts-v1`.
- Conservar versiones de ranking y contexto anteriores al corte UTC y demostrar
  su selección. Capturas tardías deben recibir rechazo temporal explícito.
- En la captura posterior, contrastar inicio real/intervalo UTC y disponibilidad
  de resultado/estadísticas; la captura previa no acredita todavía esos hechos.
  Conservar evidencia de publicación solo cuando realmente exista.
- Pasar los validadores V3 existentes con el historial completo de dependencias
  y su frontera documentada. Tener una respuesta estadística correcta es solo
  aceptación de captura, no autorización para entrenar o activar un candidato.
- Mantener raw, modelo, predicciones y datos públicos idénticos; demostrar los
  rechazos de duplicados ambiguos, errores y versiones incompatibles.

#### Estado inicial recomendado y decisión pendiente

| Opción | Uso admisible y limitación | Compatibilidad actual |
| --- | --- | --- |
| Historial verificable desde una frontera declarada | Orden UTC, disponibilidad, contexto y versiones de todas las dependencias; reconstruir estado y cobertura | Es la vía compatible con el constructor V3 actual, si el historial pasa sus controles |
| Elo/forma heredados sin procedencia suficiente | Referencia de comparación; no acredita qué eventos y versiones estaban disponibles | No se importa como estado verificado |
| Checkpoint auditado | Tendría que fijar frontera, código, parámetros, orden, eventos consumidos y todas las ventanas/colas, no solo un valor Elo | El constructor actual no lo importa; requiere diseño y aprobación de implementación |
| Arranque prospectivo explícito | Elo 1.500, H2H/conteos cero y ventanas inicialmente vacías en una fecha declarada; describe historial acumulado desde esa fecha | Cambia el significado frente a historia completa; requiere metodología y contrato aprobados |

Recomiendo **captura prospectiva de evidencia y arranque explícito con periodo de
acumulación**, por no existir hoy un historial ni checkpoint certificado para el
piloto. Es una decisión pendiente de aprobación, no una modificación de V3. La
alternativa para mantener exactamente el contrato actual es aportar historial
verificable suficiente; una campaña general sin fuentes certificadas no lo crea.

La acumulación debe medirse por jugador, superficie y pareja: forma hasta 100
partidos, estadísticas hasta 2.000 y gradientes hasta 250 estados. No existe un
número fijo de días que complete esas ventanas para todos. Elo no tiene una
ventana finita cuya cobertura certifique por sí sola ausencia de efecto inicial.
Se deberá acordar si se espera la cobertura elegida o se admite historial parcial
con indicadores y reglas expresas; estas últimas cambiarían entradas/metodología.
El relleno actual de ventanas vacías y un reinicio del piloto no constituyen
historial recuperado. Ninguna de estas decisiones se implementó silenciosamente.

### Salidas privadas, reproducción y protección

Se amplió la auditoría existente mediante CSV/JSON y un script puntual que llama
a los normalizadores y validadores de producción; no se añadió otro framework ni
se modificó código operativo. Directorio:
`data/processed/audit-2026-10-03-v3-pilot/`.

- `baseline.json`, `evidence.json`, `archive-queries.json`: fuentes, versiones,
  localizadores, precisión y cotas. `final-audit/dependency-quality.json` detalla
  controles de valores y coincidencias. Se conserva la primera pasada y su script.
- `final-audit/`: entradas candidatas sin etiquetas, `labels.csv`, estadísticas
  observadas separadas, identidades/ranking/contexto, referencias de historial,
  cotas UTC, rechazos y manifiesto. **Es la auditoría comprobada, no un subconjunto
  elegible**; `eligible-inputs.csv` tiene cero filas. No contiene features generadas.
- `final-reproduction/` y `completed-reproducibility.json`: los **14 archivos** de
  salida coinciden byte a byte, utilizando las mismas versiones locales.

Reproducción desde la raíz, con un directorio de salida nuevo:

```powershell
$env:PYTHONPATH = 'src'
.\.venv\Scripts\python.exe data/processed/audit-2026-10-03-v3-pilot/audit-pilot.py --output-dir data/processed/audit-2026-10-03-v3-pilot/reproduction-new
```

El script rechaza un destino existente o fuera de `data/processed`, verifica las
huellas congeladas y toma el lock compartido sin iniciar recargas. Requiere las
versiones locales enumeradas: si una mensual posterior las cambia, aborta en vez
de afirmar una reproducción con datos distintos. No debe restaurarse raw para
sortear esa comprobación. Código/configuración y fuentes locales quedan fijados
por SHA-256; las consultas externas no se repiten durante la reproducción.

Validación de esta fase: **19 pruebas temporales/estadísticas recientes y dos de
normalización de conteos**, todas correctas. Se excluyeron los dos tests que crean
artefactos de modelos, incluso de prueba. Se verificaron coincidencias, cotas,
rechazos completos, ausencia de duplicados directos y reproducción. No se ejecutó
la batería web ni build: no cambia contenido ni comportamiento de la web.

Los **268 archivos protegidos** de raw, modelos, predicciones, originales, muestras
y datos públicos conservaron su contenido. Se mantiene la mensual del 28/09,
su modelo `notebook_legacy` y sus predicciones. No se activó V3 ni se alteró la
corrección de fechas de presentación o la tabla pública de 53 días contrastados.

## Corrección estadística y protección del modelo: 3 de octubre de 2026

Esta revisión sucede al piloto documental publicado en `19bc056`. Se autorizó
expresamente la corrección y las protecciones de consumidores. **El defecto del
código está corregido y los siete partidos se reextrajeron en salidas aisladas;
raw y las salidas operativas permanecen intactos.**

### Causa y semántica aplicada

Ambos extractores asignaban el numerador de `Service Points Won` a `svpt` y
trataban otras fracciones mediante texto/selección dependiente del formato. El
primer formato aceptaba también cualquier etiqueta que empezase por Break Points,
confundiendo potencialmente puntos convertidos con salvados; su conversión
numérica podía concatenar cifras de porcentajes y cantidades. Los consumidores
esperan `svpt` como todos los puntos disputados **al servicio de ese jugador**.
No es el total de puntos del partido ni los puntos ganados al servicio/al resto.
Además, la cabecera ATP actual carece del marcador de ganador: el código antiguo
tomaba su ausencia como victoria del segundo jugador y **cruzaba las estadísticas
de los participantes**. Reproducir el extractor anterior con las respuestas
actuales genera exactamente los 18 campos dañados del anual en los siete partidos.
Esta igualdad no acredita que la respuesta íntegra actual fuera históricamente
la misma versión.

Los dos formatos usan ahora un lector compartido por etiqueta, independiente
del orden de métricas. `109/174` aporta 109 ganados al servicio y 174 disputados;
un porcentaje visible permanece en la evidencia y nunca se convierte en cantidad.
Servicio, resto y total conservan campos distintos. `1stIn` usa su numerador,
`1stWon/2ndWon` sus puntos ganados y `bpSaved/bpFaced` la fracción de puntos
salvados, sin usar convertidos ni juegos ganados como reemplazos.

Se conservan ausencias y ceros expresos. Un total derivado necesita ambos
componentes compatibles y registra suma, componentes y procedencia; no se deriva
una cantidad de un porcentaje redondeado. Las contradicciones entre cantidades,
denominadores, servicio/resto/totales y dobles faltas provocan rechazo. No se exigen
mínimos por marcador ni un partido terminado a datos parciales o retiradas.
Cuando falta el marcador de ganador, la orientación exige el resultado ya
acreditado y coincidencia inequívoca de ambos nombres con los enlaces de perfil
ATP completos. No se utilizan nombres abreviados ni la posición como prueba de
victoria. Identidades diferentes o un marcador contradictorio causan rechazo.
Las pausas, cierre/minimización de Chrome y tratamiento de Cloudflare permanecen.

### Compatibilidad y archivos privados modificados

Las nuevas extracciones llevan `statistics_contract_version=atp-service-counts-v1`
y procedencia serializada. Esto identifica una definición estadística corregida;
no modifica `strict-pre-match-v3` ni certifica disponibilidad temporal.

| Archivo privado | Cambio |
| --- | --- |
| `src/tennis_pipeline/scraping_functions.py` | Lector común, fracciones/unidades, orientación contrastada con perfiles/resultados, campos separados, validación y disponibilidad que ignora metadatos |
| `src/tennis_pipeline/tournament_sync.py` | Cantidades numéricas finitas como disponibilidad; caché conserva versión, procedencia y conteos |
| `src/tennis_pipeline/validation.py` | Rechazo compartido de estadísticas versionadas en rutas actuales de modelos |
| `src/tennis_pipeline/preprocessing.py` | Conservación del marcador y rechazo antes de selección/escritura legacy |
| `src/tennis_pipeline/features.py` | Rechazo no estricto antes de transformación; todos los splits se validan antes de escribir; predicciones de auditoría heredan incompatibilidad del historial |
| `src/tennis_pipeline/training.py` | Rechazo antes de entrenar/crear artefactos; marcador fuera de variables numéricas |
| `src/tennis_pipeline/prediction.py` | Rechazo antes de cargar modelos/escribir y comprobación de contrato estricto frente a artefacto legacy |
| `src/tennis_pipeline/evaluation.py` | Misma protección antes de evaluar el modelo por ambas entradas |
| `tests/test_scraping_statistic_semantics.py`, `test_statistics_contract.py`, `test_statistics_alignment.py`, `test_statistics_evaluation_contract.py`, `test_atp_saved_statistics_response.py` y respuesta real reducida en `tests/fixtures/` | Regresiones offline de extracción, ausencia/ceros, coherencia, cabecera sin ganador, caché, identidad, procedencia y ausencia de sustituciones |
| `tests/test_scraping_browser_lifecycle.py`, `test_incremental_scraping.py`, `test_download_history_integration.py` | Dobles de descarga adaptados al contexto de identidad; se verifica su envío y se conservan comprobaciones de pausas/caché |

El modelo activo conserva sus 77 variables y su semántica heredada. Los porcentajes
recientes de aces, dobles faltas, primeros/segundos servicios y sus ventanas pueden
cambiar con las correcciones. **Las rutas del modelo rechazan estadísticas
marcadas antes de generar entradas incompatibles.** Desde la corrección del
05/10/2026, el actualizador puede continuar con resultados, rankings y estadísticas
de presentación, dejando explícitamente bloqueadas las predicciones y el
entrenamiento. No reutiliza variables del modelo para enriquecer las estadísticas
corregidas. Consulta [la recuperación de la recarga diaria](recarga-automatica.md#estadísticas-corregidas-y-modelo-anterior-05102026).
Los datos heredados sin marcador conservan su ruta; eso no certifica su calidad.
Incluso entrenar/evaluar/predicir en modo estricto con datos marcados permanece
bloqueado hasta definir una transición compatible de artefactos. La auditoría de
features estrictas puede conservar la procedencia para examinarla, sin activar
consumidores del modelo. No se reproduce deliberadamente el error como fallback.

Son operaciones separadas: **corregir extractor** y **reextraer el piloto aislado**
(realizados), **sustituir raw**, **regenerar variables**, **entrenar** y **activar**
(no realizadas). La transición posterior debe fijar fuentes y contrato homogéneo,
producir derivados/candidato aislados y validar antes de una activación explícita.

### Comparación del piloto y límites de la fuente

El Excel `US_Open_stats.xlsx` y el anual contienen los mismos diccionarios
dañados, sin fracciones originales. El HTML archivado es un cuadro de Munich 2025,
no la página estadística de estos encuentros. El HTML reducido de la regresión es
sintético y trazable al ejemplo anterior; no acredita las cifras reales del piloto.
Se añadió también una respuesta actual real reducida para comprobar cabecera,
identidades, conteos y formatos sin depender de la red durante las pruebas.

Una consulta HTTP directa a ATP `ms007` devolvió 403/Cloudflare. El cliente Chrome
normal ya existente sí obtuvo la página: se mantuvieron minimización, pausa y
cierre originales, sin resolver desafíos. Esa primera captura se reutilizó; se
leyeron las otras seis páginas una vez, con pausas y sesiones separadas. Se
conservan DOM exactos renderizados, tiempos UTC y huellas. **Un DOM renderizado
no es el cuerpo HTTP original ni acredita un estado HTTP**; este queda desconocido
en esas capturas. La respuesta HTTP 403 se conserva aparte. Ninguna observación
actual es una versión disponible antes del partido.

| Partido, ganador–perdedor | `svpt` anterior, ganador/perdedor | Total corregido acreditado | Resultado |
| --- | --- | --- | --- |
| MS007 Shelton–Alcaraz | 109 / 102 | 160 / 182 | Conteos de puntos coherentes; calidad de juegos de servicio pendiente |
| MS006 Tiafoe–Michelsen | 100 / 109 | 183 / 171 | Conteos de puntos coherentes; calidad de juegos de servicio pendiente |
| MS004 Zverev–Van de Zandschulp | 43 / 58 | 86 / 79 | Conteos de puntos coherentes; calidad de juegos de servicio pendiente |
| MS005 Khachanov–Blockx | 45 / 51 | 66 / 74 | Retirada admitida; calidad de juegos de servicio pendiente |
| MS002 Zverev–Khachanov | 71 / 78 | 111 / 100 | Conteos de puntos coherentes; calidad de juegos de servicio pendiente |
| MS003 Shelton–Tiafoe | 81 / 75 | 114 / 121 | Conteos de puntos coherentes; calidad de juegos de servicio pendiente |
| MS001 Zverev–Shelton | 82 / 84 | 116 / 122 | Conteos de puntos coherentes; calidad de juegos de servicio pendiente |

Se reprocesaron siete decisiones/controles en un destino nuevo. **Siete conteos
reextraídos desde sus respuestas actuales y cero elegibles V3.**
No se reemplazó `svpt` por `1stIn` de raw: también es incoherente y no demuestra
el denominador perdido. El CSV corregido contiene siete filas y el de entradas
elegibles solo encabezados. Los siete paquetes antiguos siguen rechazados por
conteos; los nuevos pasan las restricciones de puntos. **La fuente devuelve
`Service Games Played=0` en ambos lados de los siete encuentros**: se conserva
el valor declarado y una advertencia de calidad, sin inventar juegos ni certificar
el paquete como completo. El normalizador deja ese indicador sin dato válido.
Esto permanece separado del rechazo temporal: cinco inicios UTC pendientes,
siete versiones de ranking/contexto previas al corte no acreditadas e historial
causal no certificado. Los dos inicios UTC acreditados se conservan.

### Impacto acotado y validación

El inventario lee únicamente anuales 2025/2026; no regenera la historia:

| Fuente | Filas | Filas con violaciones de conteos examinadas | Sin estadísticas en ambos lados |
| --- | --- | --- | --- |
| 2025 | 2.944 | 0 | 259 |
| 2026 | 2.952 | 1.617 | 143 |

En 2026, primeros servicios dentro superan `svpt` en 533 ganadores/902 perdedores;
segundos ganados superan sus puntos disputados en 1.615/1.617. La igualdad
`svpt=1stWon+2ndWon` aparece en 1.622/1.621 lados: es un patrón compatible con el
defecto, no prueba causal individual. Cero violaciones en 2025 tampoco certifica
procedencia o semántica. Normalización pública y ventanas del modelo están
afectadas; los datos públicos publicados no se cambiaron ni se auditaron de nuevo.

La regresión mínima falló antes en los dos formatos y pasa después. También se
registraron fallos previos de protección/modelo y evaluación. Validación final:
**157 pruebas correctas, dos excluidas por implicar entrenamiento/artefactos**, y
compilación Python correcta. Incluye consumidores, joins/IDs, porcentajes,
ausencias, caché, pausas/cierre del navegador y metadatos temporales. No se ejecutó
entrenamiento, calibración, mensual, modelo real ni QA/build web.

Auditoría privada nueva: `data/processed/audit-2026-10-03-statistics-fix/`.
`final-audit/` y `final-reproduction/` conservan comparación, inventario, controles
de IDs, validadores, referencias/huellas de fuentes y manifiesto; los once archivos coinciden
byte a byte sin consultas durante la reproducción. `audit-statistics-current.py`
exige destino nuevo, huellas congeladas y lock libre. Se conservan también las
primeras salidas `results/` y `reproduction/`, anteriores a la lectura Chrome.
Los DOM congelados se guardan en `current-atp-sources/`, sin duplicarlos en esas
carpetas de resultados.
Las huellas distinguen el texto UTF-8 del DOM capturado de los bytes del fichero
guardado con saltos CRLF en Windows; ambos se verifican sin modificar la evidencia.
El piloto anterior y sus 96 archivos
permanecen intactos; no se rehacen sus 14 salidas con el código nuevo.

Se comprobaron las 268 huellas protegidas y 49 archivos operativos derivados
adicionales. Modelo/predicciones siguen siendo los de la mensual del 28/09/2026.
Código/pruebas/datos privados permanecen ignorados; se publica únicamente esta
documentación y el plan. La comprobación del despliegue corresponde al mismo
commit documental; los logs privados de Vercel no están disponibles.
