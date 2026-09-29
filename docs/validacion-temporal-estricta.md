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

## Contrato opcional `strict-pre-match-v2`

V2 sustituye al contrato inicial V1, que no representaba la disponibilidad de
resultados nocturnos. Los artefactos V1 no se aceptan como V2. El actualizador
mantiene su modo heredado; no se ha activado un reemplazo del modelo.

Entradas necesarias:

| Campo | Significado |
| --- | --- |
| `match_date`, `match_date_verified` | Día ISO de inicio del partido, contrastado a nivel de partido |
| `result_available_date`, `result_available_date_verified` | Día en que el resultado estuvo disponible; obligatorio para partidos observados, vacío para predicción |
| `ranking_date`, `ranking_date_verified` | Snapshot contrastado del que proceden ranking y puntos |
| `player_context_available_date`, `player_context_available_date_verified` | Disponibilidad contrastada del contexto de ambos jugadores, incluidos edad y altura |
| `source_split` | Entrenamiento, periodo posterior o predicción; esta última nunca escribe historial |

Los indicadores son declaraciones de verificación, no pruebas por sí solos.
Hay que conservar las fuentes y contrastar los valores. El código no convierte
fechas de torneo, datos actuales del catálogo o rankings sin procedencia en
información histórica verificada.

Con días y sin horas fiables, todos los partidos de un día leen antes de aplicar
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
El manifiesto registra límites, filas excluidas y huella de variables, objetivos,
inicios y disponibilidad de la prueba final. La evaluación rechaza cambios y solo
admite el modelo seleccionado, sin `evaluate_all`. Predicción y evaluación exigen
artefactos compatibles. Esto no impide decisiones humanas posteriores basadas en
un test ya consultado.

## Cobertura real y transición pendiente

La fuente anual local de 2026 tiene 2.952 filas sin fecha individual verificada.
Los 26 Excel de torneo revisados tampoco aportan ese dato. La página de resultados
de Brisbane contiene 49 partidos pero no fechas individuales en los campos revisados.
No se deducen por ronda ni se vuelven a descargar torneos completos para esta auditoría.

Hay 17 correcciones trazables en `data/processed/match_date_corrections.csv`.
Además de las cuatro anteriores, se contrastaron doce finales y la semifinal
Sinner–Medvedev de Roma, iniciada el 15 de mayo y concluida el 16 tras una suspensión.
El [informe de fechas](auditoria-fechas-partidos-2026-09-30.md) detalla fuentes y fechas.
Estas correcciones de presentación no rellenan las fechas de inicio, disponibilidad
y contexto de toda la población de entrenamiento. No bastan para entrenar V2.

Para la transición manual, preparar entradas verificadas y generar variables con
`strict_temporal=True`. Usar directorios nuevos en `data/processed` y `models`,
sin sobrescribir el modelo activo. `train --mode strict` requiere `--train-file`
y `--test-file`; `evaluate` usa el manifiesto y el periodo posterior original para
evaluar exclusivamente la partición final. Comparar resultados y contratos antes
de activar un modelo nuevo. No se afirma una mejora sin evaluación real.

## Validación y publicación

La suite Python pasa 170 pruebas. Incluye contrafactuales del mismo día, resultados
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

Se regeneraron 31 derivados y su copia pública local, incorporando las 17
fechas y las 76 identidades contrastadas. La caché por fecha de ranking ahora
compara su contenido con la fuente: propaga correcciones y conserva archivos
inalterados. También se normalizan las etiquetas de ronda en perfiles.
QA local recorrió 31 rutas con filtros, comparador, detalles, modal y móvil sin
errores de consola. El verificador pasó; mantiene cuatro avisos no críticos:
un experimento histórico con enlaces fuera de las predicciones actuales y tres
eventos de equipos sin campeón individual. El sitio desplegado recibió el aviso;
los datasets completos regenerados permanecen locales y no se añaden a Git.

La exportación mensual local había copiado rutas personales del modelo a un CSV
público. El exportador ahora admite solo columnas de métricas públicas y se limpió
la copia generada. El modelo y las métricas privadas permanecen intactos.

Código Python, exportadores y pruebas privados permanecen locales según las
exclusiones Git. No se publican datasets completos, modelos ni evidencia detallada
ATP. Los informes están en `data/processed/audit-2026-09-29`. `data/raw` sigue intacto.
Para revertir, conservar el modelo heredado y no activar `strict`; el aviso web se
puede revertir independientemente sin alterar datos ni modelos.

Referencia metodológica: [validación temporal de scikit-learn](https://sklearn.org/stable/modules/cross_validation.html#time-series-split).
