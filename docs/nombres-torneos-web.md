# Nombre real del torneo en la web

La fuente es `Nombre_final` de `data/raw/tournaments.csv`. Por ejemplo,
`Brisbane Australia` se presenta como `Brisbane International presented by ANZ`.
Si el campo está vacío, se conserva el nombre habitual. Los datos originales no
se modifican para cambiar un texto de presentación.

`consolidation.py` conserva este campo al preparar el catálogo y lo aplica a las
exportaciones web después de construir las claves: fichas de torneos, resultados,
predicciones, tarjetas, detalle de predicciones y partidos recientes de jugadores.
Los nombres comerciales no cambian los slugs, los IDs de partidos ni los enlaces.
Las ediciones anteriores usan su propio nombre cuando existe; no heredan el
patrocinador de una temporada posterior.

La preparación de particiones y el verificador permiten una ficha sin resultados
cuando el origen y su resumen indican que todavía no hay partidos descargados,
aunque haya pasado la fecha final del calendario. Cuando se esperan resultados,
un archivo vacío sigue siendo un error. Se regeneran las particiones al cambiar
los datos o el nombre mostrado.

## Comprobaciones

- `python -m pytest tests -q`: 124 pruebas superadas, incluyendo
  `test_tournament_display_names.py` (nombre real, nombre alternativo, resultados,
  predicciones e identificadores estables).
- 15 pruebas Node de estadísticas, particiones y validación superadas:
  `match-statistics-utils.test.mjs`, `partition-utils.test.mjs`,
  `verify-web-data.test.mjs` y `tournament-surface-partitions.test.mjs`.
- Consolidación real en `data/processed/tournament-name-validation`: las 46
  ediciones actuales visibles coinciden con `Nombre_final`, sin discrepancias.
- `prepare-web-data.mjs`, `verify-web-data.mjs` y `npm run build`: correctos.
  El verificador conserva avisos de datos previos sobre el jugador 208147,
  predicciones experimentales antiguas, etiquetas de rondas y campeones ausentes.
- Chromium local con Playwright, usando las dependencias ya instaladas porque
  el plugin Browser no está disponible: búsqueda `ANZ` en `/tournaments`, apertura
  de Brisbane, paso a la tabla y navegación por teclado a un partido. Se confirma
  el nombre real en la ficha, título del navegador, enlace de retorno y contexto
  del partido. Resoluciones 1440×1000 y 390×844; sin errores ni avisos de consola,
  sin pantalla vacía, sin superposición de errores y sin desbordamiento móvil.

Las capturas y el script temporal de navegador están fuera del repositorio.
Los archivos web generados se actualizaron para la comprobación local. La prueba
no publica la web ni modifica manualmente `data/raw`.

Validación final del 26/09/2026: la recarga diaria terminó correctamente a las
17:01:14 y regeneró los datos públicos y la compilación local. En ese resultado,
las 52 ediciones de la temporada actual coinciden con Nombre_final (66 ediciones
visibles en total). Se repitió el recorrido de Chromium sobre esa compilación:
búsqueda, ficha, partido y móvil correctos, sin mensajes de error o aviso.
