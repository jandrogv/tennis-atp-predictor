# Cuadros y grid de torneos

La vista Draw permite revisar todos los resultados disponibles. Los partidos con
posición de eliminación directa se conectan en un cuadro. Las fases de grupos,
las previas y los partidos sin posición fiable se muestran en tarjetas por ronda;
no se inventan cruces para habilitar la vista.

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
