# Cuadros y grid de torneos

La vista Draw permite revisar los resultados del cuadro principal. Los partidos con
posición de eliminación directa se conectan en un cuadro. Las fases de grupos,
los partidos sin posición fiable se muestran en tarjetas por ronda;
no se inventan cruces para habilitar la vista.
Las rondas Qualifying se conservan exclusivamente en Table. El filtro consulta
las etiquetas de ronda, no el prefijo QS: las fases Round Robin de Davis Cup
pueden usar ese prefijo y siguen disponibles en Draw. Si solo hay previas, se
abre Table y Draw permanece deshabilitado.

## Correcciones de datos

En Indian Wells, Miami, Madrid y Roma 2026, la primera ronda estaba etiquetada
como Round of 32. Australian Open tenía el mismo problema. La consolidación
reconoce ese caso comprobando los 64 participantes de la ronda siguiente y los
perdedores que quedaron fuera: exige cantidades completas, jugadores únicos y
coincidencias inequívocas. Corrige round_display y round_order; conserva la
ronda original para unir estadísticas y mantener las rutas existentes.

Los cuadros antiguos sin posiciones se reconstruyen enlazando al ganador de una
ronda con su partido siguiente. Esta distribución conserva la progresión, pero
no afirma reproducir la orientación superior/inferior del cuadro oficial.
Los torneos con rondas conocidas nunca se conectan solo por la secuencia numérica
de sus filas. Round Robin y las previas no se convierten en nodos del cuadro
principal, aunque dispongan de identificadores de estadísticas MS o QS.

ATP Finals y Next Gen muestran semifinales y final conectadas, con los grupos
aparte. United Cup, las dos eliminatorias Davis y Laver Cup muestran sus partidos
en tarjetas por fase: sus resultados individuales no describen la progresión de
un cuadro individual de eliminación directa. La tabla completa sigue disponible.

## Ampliación

El cuadro ampliado usa dialog.showModal(), en la capa superior del navegador.
El pie de página ya no puede cubrirlo ni recibir clics a través del cuadro.
Mantiene el teclado dentro, bloquea el desplazamiento de fondo y restaura el foco
al cerrar. Conserva el espacio de la vista compacta para evitar saltos de página.
Funciona con Escape y con el botón de cierre; si hay un jugador resaltado, Escape
primero quita el resaltado, igual que antes.

La vista ampliada de escritorio muestra cuatro rondas cuando el torneo dispone
de ellas, también al seleccionar cuartos, semifinales o final. Prioriza una ronda
anterior y dos posteriores; en los extremos completa la ventana con las rondas
disponibles del otro lado. Incluye las posteriores que existen en el cuadro,
aunque todavía no se hayan jugado. Una ronda pendiente
conserva los ganadores conocidos o los participantes por determinar, sin inventar
resultados ni estadísticas.

La altura del cuadro parte siempre de la primera ronda visible. Las posiciones
y las conexiones ortogonales originales son idénticas para una misma ventana
de rondas, independientemente de la etapa seleccionada. Cada partido de la ronda
siguiente queda centrado entre sus dos partidos de origen. Todo el cuadro comparte
el desplazamiento; no hay columnas con scroll independiente ni conexiones curvas.
Las cuatro columnas caben desde 1280 píxeles de ancho;
en ventanas menores se puede desplazar horizontalmente y se mantiene visible la
columna seleccionada. El selector y las flechas permiten volver a cualquier etapa.
La vista compacta conserva sus tres rondas de contexto y la vista móvil muestra
los partidos de la ronda elegida.

## Archivos modificados

- src/tennis_pipeline/consolidation.py: reparación conservadora de rondas de
  presentación, exclusión de grupos del árbol y validación de la reconstrucción.
- tests/test_tournament_draw_positions.py: regresiones con cuadros de 96 y 128
  jugadores, grupos y secuencias incompatibles; incluye idempotencia e identidad.
- web/components/tournaments/TournamentResultsExplorer.tsx: Draw habilitado
  cuando existen resultados, con alternativa de tarjetas por ronda.
- web/components/tournaments/TournamentBracket.tsx: tarjetas para resultados
  sin posición, diálogo nativo y gestión de foco/espacio al ampliar.
- web/tsconfig.json: excluye archivos *.test.ts/tsx de la compilación de la
  aplicación; sus pruebas se ejecutan separadamente con Node.
- web/lib/tournaments/tournament-manifest.test.ts: acepta el BOM UTF-8 del JSON
  de imágenes, igual que su lectura en el navegador.

## Validación local del 26/09/2026

Se regeneraron los archivos en data/processed/tournament-grid-validation usando
las rutas del manifiesto de la última recarga (features y evaluación en
 data/processed/refresh, predicciones en data/predictions y modelos en models/atp).
Se reutilizó su partición de estadísticas y se actualizaron los archivos públicos
mediante prepare-web-data.mjs. No se modificó manualmente data/raw ni se descargó
ningún torneo. Las próximas recargas aplican estas correcciones en la consolidación.

- 66 torneos y 3400 partidos conservados; 62 con cuadro de eliminatorias y 4
  con tarjetas por fases. 2624 posiciones válidas, sin duplicados: se comprobó
  la ronda y que cada ganador conectado aparece en el partido siguiente.
- Recuperados los 95 partidos de cada uno de los cuatro Masters afectados.
- Conservadas exactamente las 2707 rutas de estadísticas de partidos.
- 128 pruebas pytest superadas; 17 pruebas TypeScript con Node superadas.
- tsc --noEmit, verify-web-data.mjs y npm run build correctos. El verificador
  mantiene los nueve avisos anteriores de datos, ajenos a estos cuadros.
- Chromium/Playwright en localhost:3000: recorrido de los 66 torneos, comprobando
  título, Draw habilitado, tarjetas por ronda, todas las filas de la tabla,
  ampliación por encima del pie, teclado, Escape, foco y desbloqueo al cerrar.
- Resoluciones 1440x1000 y 390x844. También se probó el selector en móvil:
  Round of 128 -> Final -> detalle del partido. Sin errores ni avisos de consola.

Las pruebas y capturas de navegador están fuera del repositorio. Otros
navegadores no se han verificado. Los resultados o estadísticas ausentes en el
origen siguen ausentes; la vista no fabrica partidos ni recupera datos de ATP.
La validación descrita arriba fue local el 26/09. Los cambios de la web se
integraron después en `main` mediante la [PR #1](https://github.com/jandrogv/tennis-atp-predictor/pull/1).

## Validación de geometría uniforme — 01/10/2026

La vista ampliada conserva el cuadro original: el selector cambia la ventana de
cuatro rondas y resalta la seleccionada. Se retiraron las columnas con scroll
independiente y las conexiones curvas porque alteraban la distribución solicitada.
Cuando el cuadro supera la altura disponible se recorre con el scroll común.

La regresión de navegador compara todas las posiciones y todos los trazados al
seleccionar octavos, cuartos, semifinales y final. Para ventanas iguales exige
geometría idéntica, conexiones rectas, tarjetas de 264×108 y cada padre centrado
entre sus dos hijos. También verifica que desplazar el cuadro no cambie esa
geometría, que las cuatro rondas sigan disponibles y que una final pendiente no
invente estadísticas. La prueba falla en la versión anterior.

Se comprueban Indian Wells, Wimbledon y Chengdu en Chrome a 1613×1244, 1280×720 y
1024×768, además de la vista móvil a 390×844. Incluye Table con los 239 partidos y
las tres rondas Qualifying de Wimbledon, flechas, resaltado del recorrido, Escape,
restauración del foco y desbloqueo del scroll de fondo. Las 65 pruebas web y la
compilación Next.js también se ejecutan. Las capturas y el script de navegador
están fuera del repositorio. No se modifican datasets, scraping ni modelos;
otros motores de navegador no se han comprobado.

## Ventana de rondas visibles — 04/10/2026

`getDrawStageWindow(stages, selectedIndex, limit)` es el cálculo común de ambas
vistas. Usa el orden real de las rondas del cuadro y un límite de tres o cuatro.
La vista normal conserva una anterior, la seleccionada y una posterior; la
ampliada prioriza una anterior y dos posteriores para explicar el camino restante.
El inicio se desplaza solo cuando la selección o los límites del cuadro lo
requieren. No depende de qué rondas tienen resultados descargados.

Con un cuadro R32 → R16 → QF → SF → F:

| Seleccionada | Normal (3) | Ampliada (4) |
|---|---|---|
| R32 | R32, R16, QF | R32, R16, QF, SF |
| R16 | R32, R16, QF | R32, R16, QF, SF |
| QF | R16, QF, SF | R16, QF, SF, F |
| SF | QF, SF, F | R16, QF, SF, F |
| F | QF, SF, F | R16, QF, SF, F |

Si hay menos rondas que el límite, aparecen todas las existentes. Si no hay
cuadro de eliminación, no se crean columnas: se conservan las tarjetas por fase
y la alternativa Table. Las rondas futuras existentes mantienen sus tarjetas
pendientes, ganadores conocidos o TBD; no se inventan resultados ni enlaces.

La selección inicial y la ronda elegida al abrir/cerrar la ampliación permanecen
intactas. El cálculo de posiciones, las conexiones ortogonales, las tarjetas,
resultados, enlaces, resaltados y controles no se modifican. La vista móvil
conserva la lista de la ronda seleccionada, por elección expresa del usuario;
en tablet/escritorio las tres/cuatro columnas comparten el desplazamiento.

Archivos de este cambio: `web/lib/tournaments/tournament-presentation.ts`,
`web/lib/tournaments/tournament-presentation.test.ts`,
`web/components/tournaments/TournamentBracket.tsx` y esta documentación.
Las pruebas de selección recorren todos los índices de cuadros de cero a nueve
rondas, ambos límites, extremos, orden, unicidad, contexto anterior/posterior,
rondas estructurales pendientes y alternancia entre vistas.

Validación local: 74 pruebas web superadas, `npx tsc --noEmit`,
`npm run build` y `git diff --check` correctos. En Chrome sin ventana se recorren
las 57 selecciones de Indian Wells, Wimbledon y Chengdu a 1440×1000, 820×1180 y
390×844, alternando ambas vistas en cada selección y recorriendo las flechas en
ambos sentidos. Se comprueban las ventanas, el resaltado, la selección conservada,
las tarjetas móviles, la alineación entre padres/hijos y los trazados ortogonales.
La misma ventana de Indian Wells se compara con la versión publicada anterior:
sus 15 tarjetas, 14 conexiones, resultados y enlaces son idénticos.

La comprobación adicional verifica la final pendiente de Chengdu, los dos niveles
de eliminación de ATP Finals, las tarjetas sin cuadro de Davis Cup, la ausencia
de resultados simulada solo en la respuesta del navegador, y Table de Wimbledon
con sus 239 partidos y Qualifying. Incluye activación con teclado, Escape,
resaltado de jugador, regreso del foco y desplazamiento horizontal/vertical común
sin alterar las conexiones. No hay errores de aplicación en consola ni
desbordamiento horizontal de la página. El detector visual señala únicamente dos
combinaciones de color del botón existente que este cambio no modifica.

Las capturas y los scripts de verificación permanecen fuera del repositorio.
La huella SHA-256 de los 271 archivos protegidos de datos/modelos/predicciones y
salidas públicas coincide con la revisión anterior. No se ejecuta el pipeline.
Otros motores de navegador y dispositivos físicos no se han probado.
