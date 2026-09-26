# Recarga incremental y edición visible

La diaria y la mensual comparten el mismo scraping. La mensual añade entrenamiento;
no vuelve a descargar los torneos completos. El inicio sigue siendo manual desde
**Actualizar ATP Insight** en el escritorio.

## Dos estados distintos

`terminado` indica si ha pasado la fecha final del calendario. No demuestra que se
hayan descargado los partidos. `completado`, en el catálogo generado
`data/raw/tournaments.csv`, controla la descarga:

| Valor | Significado | Próxima recarga |
| --- | --- | --- |
| `0` | En juego, sin datos o sin final resuelta y consolidada | Consultar resultados; descargar solo estadísticas pendientes |
| `1` | Descarga y consolidación completas | Reutilizar los datos locales |
| `2` | Resultados completos, con estadísticas que ATP no ofrece | Reutilizar resultados y dejar esas estadísticas vacías |

Criterio aclarado por el usuario el 26/09/2026: una final guardada en el CSV
anual cierra el cuadro eliminatorio. No se reabre por partidos anteriores sin
detalles, walkovers o por no tener la fase previa. Si no hay partidos o solo se
llego hasta cuartos/semifinales, se vuelve a consultar el torneo. La final debe
tener estadisticas, ser un walkover o tener confirmacion de que ATP no ofrece
sus detalles (estado 2); un error de conexion no demuestra esto. Un Excel
parcial no invalida una final ya consolidada. El checkpoint se cierra despues
de que la final este en el fichero anual.
Las eliminatorias por equipos sin cuadro SF/SF/F requieren una consulta de resultados
confirmada y que sus partidos estén resueltos; no se inventa una final individual.

Cada partido del Excel incorpora `stats_status`: `pending`, `available` o
`unavailable`. El último caso requiere tres respuestas de la página ATP sin bloque
de estadísticas y un resultado confirmado en la lista de partidos. Incluye el caso
en que falta `match-content`, causante del antiguo error de `NoneType.find_all`.
Cloudflare, los fallos de conexión y las páginas no reconocidas siguen pendientes.
El estado 2 no permite dar por completo un torneo al que le falte la propia final.
Los resultados sin estadísticas llegan al CSV anual y a la web; los valores
estadísticos quedan nulos, no se sustituyen por cero.

## Qué se consulta

- El calendario ATP se consulta una vez para descubrir ediciones y fechas.
- Las fichas de metadatos se reutilizan por ID ATP y temporada; solo se abren para
  ediciones nuevas. Los cambios de nombre no obligan a duplicar la edición.
- Se consultan resultados de ediciones pendientes que han empezado o entran en
  clasificación en los próximos tres días. Los próximos cuadros se limitan a
  siete días, conservando el filtro de torneos no terminados.
- Se combinan partidos por ID/enlace oficial; aunque dos archivos tengan igual
  número de filas, se añaden los partidos que falten. Se conservan las estadísticas
  descargadas. Los Excel de ediciones nuevas incluyen el año en su nombre.
- Los estados se comprueban con archivos locales, sin abrir sus páginas ATP.
  Se conservan las pausas y el cierre de Chrome por página de estadísticas.

Los archivos antiguos se migran automáticamente al leer el catálogo: se comprueba
lo que existe en Excel y en el CSV anual. El pipeline autorizado actualiza `data/raw/`; las ediciones manuales requieren
permiso explicito. No se borran temporadas historicas utilizadas por el modelo. Una página temporalmente vacía
puede recuperarse más adelante: para forzar esa recuperación hay que volver a
marcar el partido `pending`; el estado del torneo se recalcula en la siguiente carga.

## Lista de torneos de la web

Se publica una edición por evento: la actual cuando tiene resultados y, hasta
entonces, la del año anterior. La correspondencia usa el ID ATP, por lo que un
cambio de patrocinador o nombre no deja dos copias. Si el evento es nuevo y no tiene
edición anterior, puede figurar como próximo. Los eventos del año anterior que
todavía no han vuelto a celebrarse permanecen visibles.

La temporada prevalece sobre la fecha de inicio: una United Cup de enero puede
comenzar en diciembre del año anterior. Las eliminatorias individuales históricas
de Copa Davis no se convierten en decenas de torneos adicionales del calendario.
Esta selección afecta a los archivos de torneos de la web, no al histórico de
entrenamiento ni a los datos originales.

## Verificación y despliegue local

Validacion final: **110 pruebas Python y 15 pruebas Node pasan**.

Las pruebas cubren estados 0/1/2, semifinales/finales ausentes, páginas vacías frente
a Cloudflare, conservación de resultados sin estadísticas, fusión con igual número
de filas, reutilización de fichas, huecos antiguos y sustitución de ediciones.

En la copia de validación del 25/09/2026, 35 de 52 torneos se pudieron marcar como
completos sin red y 17 siguieron pendientes. La exportación de prueba produjo 46
ediciones de 2026 y 20 de 2025, sin slugs ni IDs duplicados. Las cifras cambiarán
cuando se consoliden los datos que se están descargando.

La carga que ya estaba abierta conserva el código Python importado al arrancar.
La nueva lógica de scraping y la columna `completado` se aplican al próximo inicio;
no se interrumpe un torneo para introducir cambios en memoria. No se ha publicado
la web ni se ha dado por terminada la recarga real en curso.

Archivos modificados: `scraping_functions.py` (descarga y caché), `scraping.py`
(selección y consolidación por temporada), `consolidation.py` (edición visible) y
el nuevo `tournament_sync.py` (estados y fusión). Las pruebas nuevas están en
`test_tournament_sync.py`, `test_incremental_scraping.py` y
`test_rolling_tournament_editions.py` y `test_incremental_annual_consolidation.py`; se retiró la prueba de la recuperación
antigua por fecha en `test_scraping_catchup.py`. El resto de esa prueba de errores
se conserva.


Actualizacion del 26/09/2026: el usuario detuvo la ejecucion antigua. Se completo
la migracion autorizada a `data/raw/` (12 archivos verificados con respaldo). Se
inicio una validacion diaria real con las nuevas rutas y la logica incremental.


La validacion real detecto el caso de una edicion sin Excel pero con estadisticas
ya presentes en su CSV anual. La descarga ahora recupera esas estadisticas por
pareja exacta y unica de jugadores dentro de la misma edicion; conserva valores ya
descargados y no asocia cruces ambiguos. Esto evita repetir consultas por la mera
ausencia del Excel. Tambien se confirmo el alias Younes Lalami -> Younes Lalami
Laaroussi, ID 207794: la ficha ATP
https://www.atptour.com/en/players/younes-lalami/l0ck/overview muestra Marruecos y
18/04/2001, que coinciden con el catalogo local.

Comprobacion adicional del 26/09/2026:
- Pasan las 9 pruebas de migracion, destinos diaria/mensual y recuperacion de
  estadisticas, incluida `test_download_history_integration.py`. Esta ultima
  ejecuta dos veces la descarga en una carpeta temporal: reutiliza el partido
  correcto, excluye otro torneo y otra temporada, y consulta solo el pendiente.
- La funcion real de asignacion de IDs, aplicada en memoria a los 1396 partidos
  del listado recien descargado, deja 0 jugadores sin ID con los alias actuales.
- La prueba diaria real sigue descargando Australian Open. El proceso arranco
  antes de los cambios de recuperacion anual y del alias de Lalami; los cargara
  en el siguiente inicio. La validacion completa de principio a fin sigue
  pendiente. Estas comprobaciones no modificaron archivos de data/raw.

Proteccion adicional de la consolidacion anual (26/09/2026):
- Se reprodujo con una prueba la perdida de un partido ya guardado al recibir
  solo parte de un torneo. `_build_completed_matches` ahora usa
  `merge_annual_matches`: actualiza coincidencias y conserva filas omitidas y
  estadisticas anteriores cuando la descarga trae valores vacios.
- Las parejas que se enfrentan mas de una vez se distinguen por enlace o ID
  oficial; si el historico no permite distinguirlas, se informa del conflicto
  antes de reemplazar el CSV. No se adivina la correspondencia.
- Validacion: `python -m pytest tests -q`: 119 pruebas superadas. Ejecutar pytest
  sin indicar `tests` tambien recorre antiguos resultados bajo `data/Test`,
  algunos con permisos restringidos; por eso se indica la carpeta de pruebas.
- Cambios: `scraping.py`, `tournament_sync.py`, la nueva prueba
  `test_annual_partial_refresh.py` y la expectativa del orden de normalizacion
  en `test_scraping_migration.py`. La ejecucion activa debera reiniciarse para
  cargar esta correccion, respetando el final del torneo o la autorizacion del
  usuario para detenerla antes. Aun no se da por completada la prueba diaria.


Validacion tras la aclaracion del usuario: 121 pruebas Python pasan. En la copia
`data/processed/refresh/validation/final-checkpoint-20260926-094652`, 39 torneos
quedan cerrados y 13 pendientes. Australian Open, Marrakech, Barcelona y Roland
Garros se excluyen. Se corrigio tambien la union de Excel antiguos sin id_num:
el enlace oficial permite conservar las 225 estadisticas de Roland Garros en
238 filas, sin duplicarlas. La ejecucion anterior se detuvo con autorizacion
explicita el 26/09/2026 a las 09:47, conservando un Excel legible y una copia en
`data/processed/refresh/backups/stop-australian-open-20260926-094723`.

Reinicio del 26/09/2026 a las 14:33:
- 122 pruebas Python superadas. La copia de validacion
  `data/processed/refresh/validation/final-checkpoint-20260926-143131`
  reconoce 40 torneos cerrados y 12 pendientes, todos desde julio.
- Las eliminatorias Davis 8096/8097 se cierran cuando la lista de resultados
  consultada despues de finalizar esta cubierta por el historico. No exigen
  una final individual ni estadisticas antiguas que ATP no ofrecia. Se admiten
  los enlaces duplicados de un mismo enfrentamiento individual de una eliminatoria.
  Una lista incompleta o consultada antes del final no cierra el torneo.
- El reinicio real usa las correcciones de finales, reutilizacion anual,
  claves de cache y conservacion de partidos durante la consolidacion. Registro:
  `data/processed/refresh/logs/20260926-143312-daily-validation.log`.
  El resultado completo de esta ejecucion sigue pendiente.
