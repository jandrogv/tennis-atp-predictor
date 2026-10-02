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
