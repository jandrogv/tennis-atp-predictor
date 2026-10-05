# Recarga de datos desde Windows


## Destino vigente de los datos (26/09/2026)

La recarga diaria y mensual escriben directamente en **`data/raw/`**, que es la
entrada del resto de scripts. La restriccion de ediciones manuales en esa carpeta
no impide que el pipeline autorizado actualice sus CSV y Excel. Las ediciones
manuales adicionales siguen requiriendo permiso explicito del usuario.

Se han migrado 12 archivos nuevos o actualizados desde la antigua copia
`data/processed/refresh/source/`: catalogo de jugadores, catalogo y lista de
partidos, cinco rankings y cuatro Excel de torneos. Cada archivo se ha verificado
byte a byte. Los archivos sustituidos tienen copia previa bajo
`data/processed/refresh/backups/raw-migration-20260926-092032-753912/`.
La copia antigua se conserva como respaldo y no se vuelve a importar tras marcar
la migracion como completa. El marcador esta en
`data/processed/refresh/raw_source_migration.json`.

Torneos y rankings se guardan tras sus fases, y las estadisticas de los partidos
se guardan progresivamente en `data/raw/Torneos/`. Los resultados procesados,
predicciones y modelos mantienen sus carpetas de salida separadas.

## Solución instalada

Abre **Actualizar ATP Insight** en el escritorio. Pulsa **Iniciar recarga diaria**
o **Iniciar recarga mensual**. Se abre una segunda pantalla con la fase, las
etapas, el tiempo y un resumen visual. El registro técnico está disponible con
un botón, sin terminal. Abrir la app no inicia la descarga. Consulta [la guía de la app](recarga-app-escritorio.md).

La recarga solo comienza al pulsar Iniciar dentro de la app. Se ha retirado la
tarea anterior de Windows: no se ejecuta al iniciar sesion ni a una hora fija.
Reinstalar con `scripts/install_refresh.ps1` mantiene este comportamiento manual.

Un bloqueo evita dos recargas simultaneas. El acceso permite actualizar varias
veces en el mismo dia. Los scripts antiguos no participan en ese bloqueo.

## Comparación de opciones

| Opción | Ventaja | Limitación |
| --- | --- | --- |
| Acceso directo | Un doble clic, con progreso visible | Requiere acordarse |
| Carpeta Inicio | Fácil de configurar | Solo se activa al iniciar sesión, sin reintentos propios |
| Programador de tareas + acceso directo | Automático, con reintentos y ejecución manual | Necesita este PC y sus dependencias |
| Servidor o servicio en la nube | Funciona con el PC apagado | Requiere alojamiento y adaptar Selenium y almacenamiento |

La opcion elegida es el acceso directo, segun la preferencia actual del usuario.
Reutiliza el pipeline Python y añade CustomTkinter para la interfaz. La app recomienda
la mensual cuando el modelo necesita actualizarse, pero el usuario decide el modo.

## Qué ocurre en cada recarga

- Diaria: descarga ATP → features → predicción → consolidación → estadísticas →
  exportación de datos web → verificación → compilación de la web local.
- Mensual: el mismo flujo, añadiendo entrenamiento y evaluación antes de predecir.
- La mensual sustituye a la diaria ese día: no se descarga ni calcula todo dos veces.
- Para recomendar la mensual se usa un mes natural desde `created_at` del manifiesto de entrenamiento. Por
  ejemplo, un entrenamiento del 31 de enero vence el último día de febrero.
- Si no hay modelo/manifiesto válido o quedó una mensual interrumpida, se recomienda mensual.
- La selección explícita se respeta: diaria conserva el modelo; mensual fuerza
  entrenamiento. El modo automático de la CLI mantiene la decisión por antigüedad.
- Las fechas de éxito solo avanzan al completar todas las fases, incluida la web.
  Los fallos quedan registrados y permiten reintentar. Ante un error controlado de
  entrenamiento o de las fases posteriores, se restauran los archivos del modelo
  anterior. Un apagado forzoso puede dejar salidas parciales; la siguiente mensual
  vuelve a generarlas y nunca interpreta esa ejecución como un éxito.

### Estadísticas corregidas y modelo anterior (05/10/2026)

La diaria del 5 de octubre descargó los datos, pero se detuvo antes de predecir:
72 encuentros de Chengdu, Hangzhou, Beijing y Tokyo incorporaban el contrato
`atp-service-counts-v1`, incompatible con las rutas del modelo activo. No fue un
fallo de descarga ni de nombres. Los avisos de estadísticas ATP vacías eran
incidencias recuperables distintas del error final.

El actualizador comprueba ese contrato antes de generar variables. Cuando encuentra
la versión corregida y el modelo seleccionado todavía no es compatible, actualiza
resultados, cuadros, jugadores, rankings y
estadísticas de presentación sin construir entradas para el modelo ni ejecutar
predicciones. El Elo mostrado se calcula directamente con ganadores, perdedores
y superficies; no consume estadísticas al servicio ni variables antiguas.
Las estadísticas de presentación tampoco se enriquecen con variables del modelo
guardadas antes de la transición. No se borran versiones ni se reproduce el
defecto estadístico para mantener la compatibilidad.

Los artefactos de `models/atp`, `data/predictions` y las variables anteriores
permanecen intactos. Las tablas web de predicción quedan vacías en esta modalidad
para evitar presentar probabilidades anteriores como recién calculadas. El estado
es `success_with_warnings`, con `prediction_status=blocked` y motivo explícito;
la CLI devuelve **3**, que la app interpreta como **Datos actualizados · predicciones
pendientes**. Un fallo real de consolidación, exportación, validación o compilación
sigue siendo `failed`, con salida **1**.

`last_data_success` registra la actualización de datos. `last_success` y
`last_monthly_success` solo avanzan cuando también se han completado las fases
correspondientes del modelo. Mientras el modelo seleccionado carezca de contrato
compatible, una mensual también actualiza únicamente los datos y omite el
entrenamiento. La transición aprobada que se describe a continuación habilita de
nuevo entrenamiento y predicciones; no activa V3.

También se corrigió la compilación local en Windows: Control de aplicaciones
bloquea el módulo nativo SWC de Next.js y Turbopack no puede usar la alternativa
WebAssembly. El actualizador ejecuta `npm run build -- --webpack` en Windows,
conservando la compilación y sus comprobaciones. No modifica las políticas de
seguridad de Windows ni la configuración de compilación de Vercel.

### Transición estadística aprobada y selección mensual

El constructor opcional `--statistics-contract atp-service-counts-v1` reconstruye
los tres splits desde los anuales, sin reutilizar las variables antiguas. Conserva
la metodología operativa `notebook_legacy` y sus 77 variables, pero registra
`feature_contract_version=notebook-service-counts-v1` y el contrato estadístico
en variables, manifiesto de entrenamiento, ganador y artefactos de candidatos.

Antes de incorporar una fila comprueba que los conteos sean números finitos,
enteros y no negativos, y que sean compatibles primeros/segundos servicios,
puntos ganados, aces, dobles faltas y puntos de break. Las filas observadas
incoherentes se excluyen de las entradas del modelo, con un recuento por fichero;
no se inventan denominadores ni se reproducen los errores del extractor anterior.
Los datos sin marcador se someten también a estos controles. La coherencia
aritmética no certifica orientación histórica, procedencia ni disponibilidad UTC.
La transición tampoco corrige manualmente raw ni realiza otra extracción.

Los resultados completos de la web se leen por separado de esas entradas:
un partido excluido del modelo por estadísticas incorrectas conserva su resultado
y su posición en el torneo. Rankings, perfiles y cuadros siguen actualizándose.

**La diaria utiliza el ganador del último entrenamiento mensual.** La mensual
compara de nuevo los candidatos del perfil estándar sobre los mismos splits y
elige el mejor con el criterio existente: compara ROC AUC y, entre candidatos a
una distancia de hasta 0,005 del máximo, prioriza menor Brier y log loss; los desempates usan F1,
accuracy y ROC AUC. Sin métricas de calibración, ordena por ROC AUC, F1 y accuracy. No fija
una familia ni conserva el ganador anterior por conveniencia. El manifiesto
selecciona el artefacto, y predicción/evaluación verifican su nombre y ambos
contratos. Un modelo anterior o una versión desconocida siguen rechazados.

La preparación aprobada usa un candidato aislado, evaluación y predicciones
aisladas, con copia del modelo y derivados anteriores antes de activarlo. El
registro privado de esta transición está en
`data/processed/statistics-transition-20261005-165347/`; los candidatos se guardan
en `models/statistics-transition-20261005-165347/`. La separación histórica/año
actual y las limitaciones de fuga del modo operativo se conservan: no constituye
una validación `strict-pre-match-v3` ni demuestra mejora frente al modelo previo.

Comparación del 05/10/2026, con 98.015 filas de entrenamiento, 1.146 de evaluación
y 77 variables en ambos candidatos:

| Candidato | Accuracy | ROC AUC | Brier | Log loss |
| --- | --- | --- | --- | --- |
| `xgboost` — seleccionado | 0,8342 | 0,9191 | 0,1143 | 0,3624 |
| `xgboost_calibrated_sigmoid` | 0,8255 | 0,9139 | 0,1202 | 0,3819 |

Se excluyeron siete filas históricas y 1.617 del año actual por conteos
incoherentes. Se conservaron los 3.442 resultados de torneos, sus ganadores y
marcadores. El candidato produjo dos predicciones con probabilidades válidas;
su nombre coincide con el ganador calculado a partir de las métricas.

### Compilación Windows sin intentar la DLL bloqueada

Los comandos npm de desarrollo, compilación e inicio pasan por
`web/scripts/next-cli.mjs`. En Windows selecciona Webpack e inicializa el
WebAssembly de la misma instalación de Next.js antes de cargar el compilador,
incluidos los procesos auxiliares, mediante `NODE_OPTIONS --import`. Conserva
las opciones Node preexistentes. En otras plataformas utiliza el comando y el
compilador normales de Next.js; Vercel conserva su bundler predeterminado.

`next-wasm.mjs` exige que el binding devuelto sea WebAssembly. Solo omite el aviso
obsoleto de `experimental.useWasmBinary` que el SDK emite durante esa llamada;
comprueba después el binding y conserva los fallos de carga y restantes errores.
No edita `node_modules` ni usa variables de prueba de Next; tampoco cambia
Control de aplicaciones ni incorpora nuevas dependencias. La versión de
Next.js permanece fijada; las pruebas del runtime deben pasar al actualizarla.

Archivos de esta transición:

| Archivo | Finalidad |
| --- | --- |
| `src/tennis_pipeline/validation.py` | Coherencia de conteos y compatibilidad de entradas/modelos |
| `src/tennis_pipeline/features.py` | Reconstrucción explícita, filtrado y contrato de variables |
| `src/tennis_pipeline/training.py` | Comparación habitual y contratos del ganador/candidatos |
| `src/tennis_pipeline/prediction.py`, `evaluation.py` | Verificación del contrato y ganador seleccionado |
| `src/tennis_pipeline/pipeline.py`, `auto_refresh.py` | Transición explícita y reutilización diaria/mensual automática |
| `src/tennis_pipeline/consolidation.py` | Resultados de presentación independientes del filtrado estadístico |
| `web/package.json`, `web/scripts/next-cli.mjs`, `next-wasm.mjs` | Arranque del compilador y sus procesos en Windows |
| `tests/test_statistics_transition.py`, `test_auto_refresh_execution.py` | Conteos, exclusiones, versiones, ganador dinámico, predicción y orquestación |
| `web/scripts/next-runtime.test.mjs` | CLI instalada y binding WebAssembly en un proceso auxiliar real |

Las protecciones originales de versiones desconocidas y V3 siguen vigentes.
Se validan también los datos exportados, privacidad y la compilación completa.

Activación y recuperación verificadas el 05/10/2026:

- El entrenamiento terminó a las 17:24 y su ganador compatible quedó activo en
  `models/atp`, con referencias operativas en todos sus manifiestos.
- La diaria de comprobación terminó a las 18:59:52 con `success`,
  `prediction_status=updated` y dos predicciones. Usó los datos ya descargados,
  sin scraping; la huella del ganador fue idéntica antes y después de la diaria.
- La exportación y la compilación completa pasan. El registro no contiene el
  bloqueo de predicciones ni el intento de cargar el SWC nativo de Windows.
- Las 102 pruebas Python enfocadas y las nueve pruebas Node de runtime/privacidad
  pasan. La comprobación de privacidad se repitió sobre las salidas nuevas.
- Las 130 huellas protegidas ajenas a la activación siguen iguales. Raw,
  originales y muestras permanecen intactos; se verificaron también las huellas
  del modelo anterior en su copia de reversión.

Copia del modelo anterior: `models/atp-before-service-counts-20261005-185302/`.
Copias de derivados y estado:
`data/processed/statistics-transition-20261005-165347/activation-20261005-185302/backups/`.
Registro: `data/processed/refresh/logs/20261005-185302-monthly-transition.log`.
La evidencia privada de activación está en `activation-validation.json` dentro
de la carpeta de esta transición. El estado registra este entrenamiento validado
como la última mensual; las próximas mensuales vuelven a comparar candidatos.

Revisión de la web local en Chrome sin ventanas visibles, a 1440×1000 y 390×844:
14 comprobaciones de modelo, predicciones/filtros, dos detalles de predicción,
rankings y los torneos de Beijing y Tokyo pasan sin errores de consola ni
superposición de errores de Next.js. Las probabilidades coinciden con la nueva
exportación; las tablas conservan 42 resultados en cada torneo. El cuadro
ampliado de ordenador conserva cuatro rondas, 15 nodos y 14 conexiones rectas;
en móvil se conserva la lista de la ronda seleccionada. El plugin Browser no
estaba disponible, por lo que se utilizó Playwright ya instalado.

Para recuperar una ejecución cuya descarga ya terminó, sin volver a visitar ATP:

```powershell
python -m tennis_pipeline.auto_refresh --mode daily --skip-scrape
```

Este comando reemplaza los derivados de la recarga y la exportación web local;
no modifica manualmente raw. El acceso de escritorio conserva su uso habitual.

Archivos de implementación modificados en esta reparación (privados, respetando
`.gitignore`):

| Archivo | Cambio |
| --- | --- |
| `src/tennis_pipeline/validation.py` | Lectura previa del contrato de las fuentes; rechaza versiones desconocidas |
| `src/tennis_pipeline/pipeline.py` | Ruta de consolidación sin variables ni predicciones incompatibles; manifiesto con bloqueo |
| `src/tennis_pipeline/consolidation.py` | Resultados y Elo desde identidades/metadatos observados, excluyendo estadísticas del modelo y registros sin metadatos web necesarios |
| `src/tennis_pipeline/auto_refresh.py` | Continuación de datos, estado con aviso, fechas de éxito separadas, mensual sin entrenamiento incompatible y reanudación sin scraping |
| `src/tennis_pipeline/refresh_app.py` | Mensaje y etapas de compatibilidad; no muestra éxito de predicción o entrenamiento omitidos |
| `scripts/prepare_match_statistics.py` | Opción para no incorporar contexto de variables anteriores |
| `scripts/launch_refresh.ps1` | Reconoce el código 3 como actualización de datos con aviso, sin tratarlo como un fallo general |
| `tests/test_refresh_statistics_compatibility.py` | Regresión de bloqueo previo, conservación de artefactos, fuentes de resultados y metadatos incompletos |
| `tests/test_auto_refresh.py` | Reanudación y código de salida distinto para datos actualizados con predicción bloqueada |
| `tests/test_auto_refresh_execution.py` | Orquestación diaria/mensual, fallos posteriores y modelo conservado |
| `tests/test_refresh_app.py` | Estado visual de compatibilidad en ambos modos |

Se actualizaron esta guía, `docs/recarga-app-escritorio.md` y la sección de
compatibilidad de `docs/validacion-temporal-estricta.md`. Las 153 pruebas enfocadas
de recarga, interfaz, contratos, extracción, estadísticas y consolidación pasan.
La prueba de la nueva ruta falló antes de implementar la reparación. La salida
aislada real tiene 66 torneos y ranking del 05/10/2026; la validación Node comprueba
20 CSV y 2.807 estadísticas enlazadas, sin errores críticos. Las predicciones
vacías son el resultado esperado del bloqueo, no un nuevo fallo de descarga.

La recuperación operativa del 05/10 terminó a las **13:17:33** sin repetir el
scraping ni entrenar. El estado quedó en `success_with_warnings`, sin error;
`last_data_success` avanzó y las fechas de éxito completo/mensual conservaron el
28/09/2026. Se verificaron por SHA-256 156 archivos protegidos, incluidos raw,
modelos, variables y predicciones anteriores: ninguno cambió. Las salidas
sustituidas tienen respaldo en `data/processed/refresh/backups/recovery-20261005-130442/`.

La validación operativa revisó 21 CSV (incluido el diagnóstico opcional), sin
errores críticos. En Chrome invisible se comprobaron ranking/búsqueda, estado
vacío de predicciones, Table/Draw y enlaces de detalle de Beijing y Tokyo, en
1440×1000 y 390×844. Los dos torneos tienen 40 resultados; el cuadro ampliado de
ordenador conserva cuatro rondas y 14 conexiones rectas, y el móvil conserva
la lista de la ronda seleccionada. No se encontraron errores de consola ni
de ejecución. Se usó el Playwright ya instalado porque el plugin Browser no
estaba disponible. Las siete pruebas de privacidad también pasan.

Las 12 identidades pendientes del ranking más reciente siguen registradas en
`ranking_identity_validation.csv` y se excluyen del ranking público hasta
resolverlas; no fueron la causa del fallo de esta diaria. No se editó el catálogo
de jugadores para esta reparación. Los avisos de ausencia de campeón en eventos
por equipos y de tablas de predicciones vacías no bloquean la actualización.

El scraping existente abre ventanas de Chrome y necesita Internet. El entrenamiento
mensual consume más CPU y tarda más; se conserva `standard`, `notebook_legacy` y
`cpu`. El acceso manual no impone un limite de tiempo al torneo.

## Resultado del análisis del flujo anterior

Los scripts anteriores distinguen `refresh-web` y `full-run`, pero no controlan
periodicidad ni ejecuciones simultáneas. Además, llaman a `npm run prepare-data` y
`verify-data`, ausentes en el `package.json` actual. El lanzador nuevo utiliza las
mismas fases Python y ejecuta directamente los exportadores Node que sí existen.

La seleccion incremental distingue `terminado` de `completado`: recupera huecos
antiguos, reutiliza las ediciones descargadas y conserva resultados cuyas
estadisticas ATP estan vacias. La web sustituye cada edicion del ano anterior
cuando hay resultados de la nueva. El comportamiento vigente y sus estados se
detallan en [recarga-incremental-torneos.md](recarga-incremental-torneos.md).

El último entrenamiento encontrado al instalar fue del **27/06/2026** y el último
manifiesto de pipeline encontrado terminó el **11/08/2026**. A fecha de la revisión
(25/09/2026), la próxima ejecución corresponde a una recarga mensual.

El modelo actual entrena con años anteriores y evalúa con la temporada actual.
Reentrenar mensualmente no incorpora automáticamente la temporada actual a los
datos de entrenamiento. Además, `notebook_legacy` conserva variables Elo posteriores
al partido: sus métricas no deben interpretarse como validación predictiva sin fuga.
Esta automatización mantiene el procedimiento existente; cambiar el corte temporal
y comparar modelos con features previas al partido es un trabajo de modelado aparte.

## Datos, registros y publicación

El pipeline autorizado guarda las descargas en `data/raw/` y reutiliza los datos
ya descargados. La creación de la app no modifica esos archivos. `data/sample`,
los notebooks y los scripts originales permanecen intactos.

| Ruta | Contenido |
| --- | --- |
| `data/raw/` | Entrada compartida y destino de las descargas diarias/mensuales |
| `data/processed/refresh/features/` | Features regeneradas |
| `data/processed/refresh/evaluation/` | Evaluación |
| `data/processed/refresh/final/` | Tablas para la web |
| `models/atp/` | Modelos activos de esta automatización |
| `data/predictions/` | Predicciones actualizadas |
| `data/processed/refresh/state.json` | Último intento, éxito, error y registro |
| `data/processed/refresh/logs/` | Salida de cada ejecución |
| `web/public/data/` | Exportación pública local, reemplazada al actualizar |

La entrada histórica `data/Test/processed_final/final_dataset.csv` sigue leyéndose
por compatibilidad. En la primera ejecución se reutilizan el modelo y la evaluación
existentes como punto de partida. No se hacen commits, push ni despliegues. La web
publicada en Internet no cambia hasta publicar los nuevos datos. Los exportadores
actuales escriben por archivos, no de forma transaccional: tras un fallo no publiques
las salidas parciales; espera a una recarga con estado `success`.

## Mantenimiento

Estos comandos son únicamente para reinstalar o diagnosticar; el uso normal es el acceso directo.

```powershell
# Reinstalar si mueves el repositorio a otra carpeta
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install_refresh.ps1

# Consultar la decisión sin descargar, entrenar ni escribir datos
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\launch_refresh.ps1 -Automatic -DryRun

# Quitar la tarea y el acceso directo, conservando los datos
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install_refresh.ps1 -Remove
```

La tarea **ATP Insight - Recarga de datos** se ha retirado. Los scripts y el modulo
Python son locales y estan excluidos de Git por la politica actual del repositorio.

## Verificación realizada

Se han probado selección diaria/mensual (incluido fin de mes), bloqueo de doble
inicio, conservación de originales, registro de fallos, restauración del modelo,
recuperación de torneos tras una pausa y compatibilidad con las pruebas de scraping.
La simulación local selecciona correctamente la mensual. También se han comprobado
la sintaxis de PowerShell y Node y las pruebas de particiones/verificación web.

La revisión de los datos públicos anteriores encontró siete errores de validación:
cuatro columnas ausentes, dos estados de torneos caducados y una partición sin
partidos. Las columnas sí existen en las salidas del consolidador actual; la
regeneración actualiza los estados y la recuperación consulta los torneos omitidos.
La solución no da por reparada la cobertura de ATP hasta terminar una recarga real.
El instalador retira la tarea programada anterior y el acceso del escritorio
llama ahora a `launch_refresh_app.pyw` mediante `pythonw.exe`, sin consola.
La retirada de la tarea no interrumpe una carga ya iniciada.

## Archivos de implementación

- `src/tennis_pipeline/auto_refresh.py`: selección de frecuencia, ejecución, estado,
  bloqueo, registros y rutas protegidas.
- `src/tennis_pipeline/scraping.py`: recuperación de torneos y errores de salida.
- `src/tennis_pipeline/refresh_app.py`: selector diario/mensual y registro en vivo.
- `scripts/launch_refresh_app.pyw`: entrada de escritorio sin terminal.
- `scripts/launch_refresh.ps1`: entrada de consola conservada para diagnóstico.
- `scripts/install_refresh.ps1`: instalación y retirada de tarea/acceso directo.
- `web/scripts/prepare-web-data.mjs`: permite indicar el origen de datos mediante
  `ATP_WEB_SOURCE_DIR`, manteniendo el valor anterior para otros usuarios.
- `tests/test_auto_refresh.py`, `tests/test_auto_refresh_execution.py` y
  `tests/test_scraping_catchup.py`: pruebas de decisiones, ejecución y recuperación.
- `docs/recarga-automatica.md`: comparación, uso y límites de la automatización.

## Recarga real del 25/09/2026

Se inicio una recarga diaria explicita, sin reentrenar el modelo. Se descargaron
rankings y partidos, pero la recarga completa NO termino: se detuvo con autorizacion
del usuario al aparecer la verificacion de Cloudflare durante Cincinnati.
Los Excel conservan los partidos descargados y el estado del intento queda como
fallido/interrumpido, sin avanzar la fecha de exito.

Correcciones conservadas:

- `scraping.py`: admite fechas ISO del fichero anual para recuperar solo los
  torneos pendientes desde la ultima fecha real.
- `scraping_functions.py`: alias `JiSung Nam` -> `Ji Sung Nam` (106227) y
  `N.Sriram Balaji` -> `N Sriram Balaji` (105502), comprobados en el catalogo local.
  Hanlei Lu no figura en ese catalogo; no se le asigna un ID de otra persona.
- Se excluyen identificadores de cuadros de dobles MD/QD, conservando MS/QS.
- La columna `match_stats` se convierte a object al reanudar un Excel para poder
  guardar diccionarios con pandas sin errores de tipo.
- `auto_refresh.execute_refresh` admite omitir el scraping al continuar una
  descarga ya completada; la ejecucion normal sigue descargando los datos.

Se revirtio el cambio que reutilizaba Chrome y esperaba solo a encontrar contenido.
La descarga de estadisticas conserva el comportamiento anterior: pausa de ocho
segundos antes de cada intento, Chrome nuevo para cada pagina, ocho segundos tras
abrirla y cierre al terminar, tambien si hay una excepcion. La aparicion de
Cloudflare coincidio con aquel cambio; no se ha demostrado una causa unica ni
verificado aun otra descarga real tras restaurarlo.

Las 25 pruebas seleccionadas de scraping, alias, ciclo del navegador, recuperacion
y automatizacion pasan. Los archivos de pruebas adicionales son
`tests/test_scraping_name_aliases.py` y `tests/test_scraping_browser_lifecycle.py`.
No se han modificado los originales ni los datos de `data/raw/`.

## Identificacion de jugadores

Primero se consulta `atp_players.csv`: nombre y apellidos por separado, nombre
completo en una sola columna, espacios sobrantes e iniciales. `id_players` e
`id_players_2` admiten columnas de nombre vacias sin convertir el nombre en nulo.
No se asigna un ID a nombres completamente vacios.

Si la identidad no queda clara, se contrasta la ficha oficial ATP con el pais y
la fecha de nacimiento del CSV. Solo una identidad confirmada permite incorporar
un alias a `correct_names`; las iniciales no se expanden por parecido de texto.
Si falta la persona en el catalogo, no se reutiliza el ID de un homonimo.
Las correcciones se hacen en produccion; los CSV originales de `data/raw` se
mantienen intactos. No hay una busqueda web automatica por cada partido.


Revision del 25/09/2026: la ficha oficial de
[Hanlei Lu](https://www.atptour.com/en/players/hanlei-lu/l0pl/overview) se consulto
con Chrome y confirma China, nacimiento 12/04/2009, 178 cm y diestro. Se busco
antes en ambas columnas del CSV y despues por pais y fecha. El catalogo local no
contiene Hanlei Lu ni registros con fecha 20090412. `l0pl` es su identificador ATP,
no un ID numerico del catalogo: no se ha sustituido por otro jugador.

Validacion del modo manual y nombres: 30 pruebas pasan. Se comprobaron la ausencia
de la tarea programada y los argumentos del acceso directo. Una carga mensual que
ya habia arrancado antes de retirar la tarea continua sin interrupcion; los cambios
en funciones Python se aplican a las siguientes ejecuciones que importen el modulo.


Alta autorizada posteriormente por el usuario: Hanlei Lu se incorpora al catalogo
activo `data/processed/refresh/source/atp_players.csv` con ID local **214588**, el
siguiente al maximo 214587. Fila: `214588,Hanlei,Lu,R,20090412,CHN,178,`.
Pais, nacimiento, mano y altura se contrastaron en la ficha oficial ATP enlazada
arriba. El ID numerico sigue la secuencia local solicitada y no es el ID oficial
ATP `l0pl`. Se conserva una copia previa bajo `data/processed/refresh/backups/`.
Se verifico que todas las filas anteriores permanecen iguales, que no hay colision
del ID y que los cruces de partidos jugados y futuros ya resuelven Hanlei Lu.
No necesita un alias en `correct_names`, porque la grafia ATP y la del catalogo
coinciden exactamente. Una futura importacion de un catalogo externo debe respetar
este ID local y comprobar colisiones antes de combinar registros.
