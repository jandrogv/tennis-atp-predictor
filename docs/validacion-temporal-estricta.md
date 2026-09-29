# Auditoría temporal y transición del modelo

Fecha de revisión: 29/09/2026. El código local está validado; el modelo activo
continúa en `notebook_legacy`. No se ha ejecutado una recarga ni sustituido su
artefacto durante esta auditoría.

## Hallazgos comprobados

- `ELO_DIFF` y `ELO_SURFACE_DIFF` se calculan después de aplicar el resultado.
  El modo heredado los utiliza y excluye las seis variables Elo previas. Hay
  fuga de información demostrada; sus métricas no acreditan rendimiento causal.
- La selección heredada y la evaluación final comparten el periodo de prueba.
- Al descartar `source_split` antes del cálculo, los partidos pendientes podían
  actualizar Elo, H2H, forma y estadísticas como si ya hubiera un ganador.
  Se conserva ahora ese campo y esos partidos solo leen el historial.
- La fuente anual de 2026 tiene 2.952 filas y no contiene `match_date` ni
  `match_date_verified`. La fecha de inicio del torneo no sirve como día del
  partido. Hay dos correcciones verificadas en la tabla derivada existente.

## Contrato opcional `strict-pre-match-v1`

El modo `strict` requiere fechas ISO de partido y una verificación explícita en
todas las filas. No convierte fechas del torneo en fechas de partido. Ordena
por día y calcula primero todas las variables previas de ese día; después
actualiza el historial con resultados terminados. Sin hora fiable, omitir los
resultados de otros partidos del mismo día es una decisión conservadora.

Utiliza Elo previo y excluye las dos diferencias posteriores. Los partidos de
predicción no tienen objetivo observado ni modifican el estado. La orientación
de jugadores tiene semilla reproducible. Fecha, verificación, contrato y fuente
de partición quedan fuera de las entradas numéricas del estimador.

El entrenamiento requiere archivos separados de entrenamiento y periodo
posterior, con contratos iguales. Todas las fechas de entrenamiento deben
preceder al periodo posterior. De este último, aproximadamente el primer 60 %
de días se usa para seleccionar candidatos y el último 40 % para evaluación
final; ningún día se divide entre ambos. No es un porcentaje garantizado de filas.

La búsqueda usa validación temporal expansiva por días. Calibración y validación
interna reservan los últimos días del entrenamiento; no acceden a selección ni
evaluación final. En modo estricto no se reutilizan parámetros de un registro
anterior que pudiera haber consultado la prueba final.

El manifiesto registra límites, recuentos y huella de las entradas, objetivos y
fechas de la prueba final. La evaluación selecciona exactamente esas filas,
rechaza modificaciones y solo permite el modelo elegido, sin `evaluate_all`.
Predicción y evaluación rechazan artefactos con contrato incompatible.
Esto evita mezclar accidentalmente periodos; no evita decisiones humanas
posteriores basadas en resultados de una evaluación ya consultada.

## Conservación de fechas y estado de los datos

Las nuevas consultas de resultados ATP conservan `match_date`,
`match_date_verified` y `match_date_source` cuando la página indica el día.
Una respuesta sin fecha no borra una fecha verificada de la caché. Los datos
antiguos no se marcan como verificados automáticamente y los torneos completos
no se vuelven a descargar solo para esta auditoría.

El informe de identidades del ranking más reciente mantiene 163 nombres
pendientes: 132 sin coincidencia y 31 ambiguos. Se revisó primero el catálogo.
Las sugerencias por texto no se convierten en alias ni altas: falta contrastar
país y nacimiento en ATP, que respondió con verificación de Cloudflare o 403.

Informes locales, excluidos de GitHub:

- `data/processed/audit-2026-09-29/player_identity_review.json`.
- `data/processed/audit-2026-09-29/match_date_coverage.json`.

No se ha editado manualmente `data/raw`. Para incorporar altas al catálogo hace
falta permiso explícito sobre ese archivo y evidencia de identidad.

## Verificación y transición pendiente

Resultado: 159 pruebas de `tests` correctas y compilación Python correcta.
Las comprobaciones incluyen cambios contrafactuales de resultados del mismo día,
partidos pendientes, cortes por día, exclusión de Elo posterior, contrato de
artefactos y rechazo de modificaciones en la prueba final. La prueba de selección
usa candidatos simulados; no equivale a entrenar XGBoost o TensorFlow reales.
La lectura del anual real rechaza correctamente la falta de fechas verificadas.

Para repetir las comprobaciones desde PowerShell:

```powershell
$env:PYTHONPATH = "src"
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m compileall -q src tests
```

Antes de entrenar el modo estricto, preparar entradas con fechas de partido
trazables y revisar cuándo estaban disponibles rankings y contexto. Generar
variables con `strict_temporal=True`, conservando el contrato y las particiones.
Usar directorios nuevos de `data/processed` y `models`; no sobrescribir el modelo
activo. `train --mode strict` requiere `--train-file` y `--test-file` explícitos.
Después, `evaluate` debe usar ese manifiesto y la misma fuente posterior para
evaluar solo la partición final. Comparar resultados y contratos antes de activar
el nuevo modelo. El actualizador de escritorio mantiene su modo actual.

La mensual del usuario terminó el 28/09/2026 a las 20:25 según su estado local;
no incorpora un nuevo entrenamiento estricto. Las métricas actuales siguen
identificadas como heredadas. No se afirma que el código auditado mejore esas
métricas antes de medirlo con datos verificados.

Los módulos Python y sus pruebas son implementación privada según `.gitignore`.
Permanecen locales; esta publicación solo incluye documentación y estado del plan.
No contiene datos completos ni modelos. Para revertir este contrato en local,
mantener el artefacto heredado y no activar `strict`; no reutilizar un artefacto
estricto con variables heredadas.

Referencia metodológica: [validación temporal de scikit-learn](https://sklearn.org/stable/modules/cross_validation.html#time-series-split).
