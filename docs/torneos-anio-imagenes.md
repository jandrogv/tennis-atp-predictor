# Torneos: año por defecto y fotografías compartidas

## Año y navegación

Una visita a `/tournaments` sin `year` selecciona el año UTC de la petición. La fecha se calcula en el servidor después de `connection()` y se comparte, mediante la caché de React por petición, entre la página y sus metadatos. La ruta se renderiza dinámicamente: el cambio de 31 de diciembre a 1 de enero no requiere un nuevo despliegue. El cliente recibe la misma fecha y no muestra primero otro año.

Un `?year=2025` válido se respeta. `?year=all` conserva la consulta de todas las ediciones. El selector actualiza el parámetro con la History API integrada con Next.js; recarga, compartir enlace y atrás/adelante mantienen la selección. No se recupera el año desde almacenamiento persistente. Reset vuelve a la entrada sin parámetro y al año actual. Los demás parámetros y el fragmento del enlace se conservan. Los filtros de búsqueda y superficie mantienen su funcionamiento anterior.

El selector incluye el año actual aunque todavía no existan datos, y un año solicitado explícitamente aunque esté vacío. En ese caso aparece `No tournaments loaded for YEAR`, con una indicación para usar el selector; nunca se sustituye silenciosamente por otra temporada.

## Identidad y cobertura de imágenes

El ID de edición del contrato web es `YYYY-CODE`. `CODE` es el identificador ATP que también aparece en el enlace oficial. El resolver compartido usa ese código, conservando sus ceros iniciales. Los nombres comerciales, patrocinadores, ciudad y año no participan en la selección. Wimbledon `2025-0540`, `2026-0540` y `2027-0540` resuelven el mismo archivo; Queen's Club `0311`, también en Londres, tiene otro.

El catálogo público inventariado contiene **66 eventos** de 2025 y 2026. Antes había **2 fotografías específicas**. Ahora hay **49 eventos con fotografía**, correspondientes a **48 fotografías distintas**, y **17 pendientes explicados**. Se incorporan 46 archivos WebP nuevos en `web/public/images/tournaments/venues/`; Båstad y Umag conservan sus archivos existentes. Los archivos privados excluidos en `courts/` no se han publicado ni reutilizado.

Los IDs `8096` y `8097` identifican fases de clasificación de la misma Copa Davis en los datos disponibles y comparten intencionadamente su foto representativa. No se fusionan otras identidades. Las competiciones con sedes variables se describen como tales en el texto alternativo: Copa Davis, Laver Cup y United Cup. El Canadian Open utiliza su recinto de Montreal como fotografía representativa de la competición. La asociación estable identifica el torneo; no afirma que todas sus ediciones se disputaran en ese recinto.

Las imágenes y sus autores/licencias están registrados en [Atribución de assets](asset-attribution.md) y en el manifiesto. Los créditos visibles enlazan a la ficha original con sus condiciones de uso. Las fotos son reales, con licencia verificada en Wikimedia Commons. Se han descartado retratos, diagramas, logos y fotos de otros eventos o instalaciones equivocadas. Los exteriores se utilizan cuando no hay una vista adecuada de la pista con licencia verificada.

Se verificaron especialmente las sedes recientes: [París en La Défense Arena](https://www.rolexparismasters.com/en/news/article/rolex-paris-masters-2025-edition-paris-la-defense-arena), [Dallas en Ford Center](https://www.dallasopen.com/en/media/news/your-guide-to-the-2025-dallas-open), [Bruselas en ING Arena](https://europeanopen.be/2025/01/29/european-open-moves-to-brussels/) y [Atenas en OAKA Basketball Arena](https://www.atptour.com/en/tournaments/hellenic-championship/5100/overview). Las fotos de Olympic Tennis Centre no representan el ATP 250 de Atenas. La antigua Arenele BNR tampoco sustituye a Nastase & Marica Sports Club en Bucarest; la [guía oficial ATP de 2025](https://www.atptour.com/-/media/files/media-guide/2025/2025-atp-media-guide-full.pdf) identifica esta última sede.

Se mantiene el layout, sus gradientes de legibilidad, proporciones y carga diferida con `next/image`. Los WebP nuevos no superan 1280 píxeles de ancho y no se amplían los originales pequeños. En conjunto ocupan 8,43 MiB; el archivo mayor ocupa 447 KiB. Dallas se recorta a la fachada y Hangzhou al pequeño estadio de tenis con forma de loto. Al fallar una fotografía se carga el respaldo de la superficie, se cambia el texto alternativo a una ilustración y se retira su crédito, sin un bucle de reintentos. Un torneo desconocido recibe el mismo respaldo funcional.

## Pendientes de la galería

Revisión de fuentes y licencias: 3 de octubre de 2026. **La galería no está completa**. Estos 17 eventos conservan exactamente el respaldo de su superficie; no se crean copias genéricas con nombres de torneo. La ausencia significa que esta revisión no logró verificar una foto adecuada y reutilizable, no que no existan fotografías en Internet. Para completar un caso basta una foto real adecuada y su autorización/licencia, seguida de la entrada por ID ATP y su atribución.

| ATP ID | Torneo | Limitación concreta |
|---|---|---|
| 0314 | EFG Swiss Open Gstaad | Las fotos reutilizables localizadas de Gstaad son retratos de jugadores o voleibol; no se ha verificado una vista adecuada de Roy Emerson Arena. |
| 0321 | BOSS OPEN | La búsqueda de Weissenhof devuelve edificios del barrio y otras pistas; no se ha verificado una foto reutilizable del recinto del BOSS OPEN. |
| 0322 | Gonet Geneva Open | Las fotos localizadas son del Centre des Evaux o un logotipo, no de la pista del Geneva Open en Parc des Eaux-Vives. |
| 0360 | Grand Prix Hassan II | No se ha localizado una vista adecuada del Royal Tennis Club de Marrakech con licencia de redistribución comprobada. |
| 0403 | Miami Open presented by Itau | Las imágenes verificadas muestran jugadores, la antigua sede de Crandon Park o el Hard Rock Stadium preparado para fútbol; falta una vista adecuada de la sede actual de tenis. |
| 0440 | Libema Open | Las fotografías reutilizables localizadas de Autotron muestran jugadores en acción, no una vista adecuada del recinto o de la pista. |
| 0499 | Delray Beach Open | Las fotografías verificadas de Delray Beach son retratos o primeros planos de jugadores; falta una vista adecuada del Tennis Center. |
| 0506 | IEB+ Argentina Open | Las fuentes verificadas muestran el club histórico en blanco y negro o los Juegos de la Juventud de 2018; falta una vista actual adecuada del Argentina Open. |
| 4462 | Tiriac Open presented by UniCredit Bank | La fotografía reutilizable localizada corresponde a Arenele BNR en 2012; la sede actual es Nastase & Marica Sports Club y no se ha verificado una foto adecuada de ella. |
| 5100 | Athens | El ATP 250 de Atenas se juega en OAKA Basketball Arena/Telekom Center, no en Olympic Tennis Centre; las fotos de tenis olímpico de 2004 localizadas corresponden a otra instalación. |
| 6242 | Winston-Salem Open | No se ha verificado una fotografía reutilizable de la pista del Winston-Salem Open; los resultados de Wake Forest incluyen otros deportes y personas. |
| 6932 | Rio Open presented by Claro | No se ha localizado una vista adecuada de la pista del Rio Open en Jockey Club Brasileiro con licencia comprobada; las imágenes de hipódromos no identifican su recinto de tenis. |
| 7290 | Millennium Estoril Open | Las imágenes verificadas del Estoril Open son logos o retratos; falta una vista reutilizable adecuada del Clube de Tenis do Estoril. |
| 7480 | Mifel Tennis Open by Telcel Oppo | No se ha localizado una fotografía adecuada del Cabo Sports Complex con condiciones de redistribución verificadas. |
| 7581 | Chengdu Open | No se ha localizado una vista adecuada del Sichuan International Tennis Center con licencia de redistribución verificada. |
| 7696 | Next Gen Finals | No se ha verificado una fotografía adecuada de la pista de los Next Gen Finals en Jeddah; no se utilizarán imágenes de la antigua sede de Milan ni del estadio de fútbol de King Abdullah Sports City. |
| 8994 | Vanda Pharmaceuticals Mallorca Championships | No se ha localizado una vista adecuada de las pistas de hierba del Mallorca Country Club en Santa Ponsa con licencia de redistribución comprobada. |

## Verificación y alcance

Las pruebas de `web/lib/tournaments/` cubren el salto de año, los enlaces explícitos y vacíos, las ediciones futuras de todos los eventos, los nombres comerciales, las colisiones, los archivos locales y los faltantes documentados. La revisión de navegador comprueba la navegación por URL e historial, las fotografías y el respaldo ante un error real, además de escritorio, tablet y móvil. Las evidencias temporales de QA se guardan fuera del repositorio.

Resultados locales: 70 pruebas web correctas, `tsc --noEmit` y `npm run build` correctos; 52 archivos de imagen distintos comprobados por HTTP, decodificación y optimizador de Next.js (48 fotos y 4 respaldos). Se ha navegado en escritorio 1440×1000, tablet 820×1180 y móvil 390×844, sin overflow ni errores de consola. La simulación del servidor a 1 de enero de 2027 con el mismo build selecciona 2027, conserva su estado vacío y genera los metadatos de 2027, sin errores de hidratación. Con el mismo build y fecha simulada de 3 de julio de 2026, el carrusel de Wimbledon también carga la misma foto y sus créditos en escritorio, tablet y móvil. El detector de impeccable solo señala un estilo gris sobre lima preexistente en el botón del carrusel; no se cambia la paleta existente.

Por petición adicional se ha entrado individualmente en los siete torneos con fechas en septiembre: US Open, Davis Cup Qualifiers 2nd Rd, Chengdu, Hangzhou y Laver Cup de 2026, más Tokyo y Beijing de 2025. Los seis eventos con foto cargan el archivo correspondiente. Chengdu conserva el respaldo de pista dura y sigue pendiente por la limitación indicada en la tabla. No se considera la prueba de carga del respaldo equivalente a tener una foto del recinto.

Archivos de comportamiento: `web/app/tournaments/page.tsx`, `TournamentsBoard.tsx` y el resolver `tournament-presentation.ts`. Presentación de imágenes: `TournamentImagePanel.tsx`, `ActiveTournamentCarousel.tsx`, `TournamentVisualHeader.tsx`, el manifiesto y los 46 WebP. Pruebas: `tournament-year.test.ts`, `tournament-presentation.test.ts` y `tournament-manifest.test.ts`. Documentación: este archivo y `asset-attribution.md`.

Esta tarea no modifica los datos públicos, raw, muestras, notebooks, originales, código del pipeline, modelos ni predicciones. No ejecuta recargas o entrenamientos ni altera las protecciones estadísticas o la metodología V3.
