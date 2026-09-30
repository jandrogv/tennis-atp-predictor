# Correcciones de la auditoría web (27 de septiembre de 2026)

Este informe conserva las comprobaciones del 27/09, anteriores a la migración
a Next.js 16.3.6. El estado del 30/09 y las correcciones posteriores se describen
en las auditorías de [identidades](auditoria-identidades-atp-2026-09-30.md),
[fechas](auditoria-fechas-partidos-2026-09-30.md) y
[validación temporal](validacion-temporal-estricta.md). La entrega actual en `main`
incluye los datos públicos renovados, con autorización expresa del usuario.

## Cambios aplicados

- La publicación de perfiles, directorio, comparador y columnas ATP de Elo utiliza el mismo último snapshot fechado de `web_atp_rankings.csv`. No mezcla el ranking histórico de mayo con el de septiembre. Se eliminan IDs repetidos antes de los joins.
- La resolución de nombres comparte `cleaning.normalize_player_name`, también utilizada al descargar partidos. No se unen homónimos con país o nacimiento distintos. Los registros pendientes no reciben IDs por aproximación.
- Los resultados publicados tienen prioridad sobre sus copias de features al construir partidos recientes y rendimiento por superficie. La clave compara torneo, temporada, jugadores y ronda; en round robin mantiene el día para conservar encuentros distintos.
- La fecha del último partido, los balances del perfil y la forma reciente usan también esos resultados consolidados. Las apariciones no se cuentan dos veces cuando hay columnas de ID con ambas convenciones. Los partidos históricos sin metadatos suficientes se conservan.
- La ventaja de ranking ATP favorece al número menor. Se conserva la diferencia original, pero se corrige el jugador favorecido, la dirección de la barra y la explicación.
- Las filas ATP sin ID tienen una clave de React distinta por nombre y puesto. Ordenar ya no debe crear filas repetidas.
- La cuadrícula de partidos recientes permite que su tabla se desplace dentro de la tarjeta en móvil, sin ensanchar toda la página.

## Fechas y protección del origen

`data/raw` no se modifica. Las fechas de torneos no bastan para conocer el día de cada partido. La descarga conserva `match_date` cuando la página indica el día mediante atributos, un elemento time, el encabezado diario o un filtro matchDate. Si no lo indica, el extractor deja ese campo vacío.

La consolidación admite `data/processed/match_date_corrections.csv`: torneo, ganador, rival, ronda, marcador, fecha ISO y URL ATP. Solo aplica cruces únicos y de la misma temporada. Los dos casos comprobados son:

- [Final de Brisbane](https://www.atptour.com/en/news/medvedev-nakashima-brisbane-2026-sunday): Medvedev–Nakashima, 11 de enero de 2026.
- [Sinner–Kecmanovic](https://www.atptour.com/en/news/sinner-wimbledon-2026-reaction-r1): primera ronda de Wimbledon, 29 de junio de 2026.

Queda pendiente recuperar los días reales del resto del histórico. No se deben inferir solo a partir de la ronda. ATP presenta Cloudflare en la consulta de resultados utilizada durante esta revisión; la sesión se cerró sin reintentar la verificación. Las fechas antiguas de los demás partidos todavía no se pueden certificar.

## Identidades contrastadas

País y fecha de nacimiento coinciden con los registros existentes del CSV:

| Nombre ATP | ID local | País | Nacimiento | Fuente |
|---|---|---|---|---|
| Aleksandr Shevchenko | 207686 | KAZ | 2000-11-29 | [ATP](https://www.atptour.com/en/players/alexander-shevchenko/s0h2/overview) |
| Andy Andrade | 200748 | ECU | 1998-12-14 | [ATP](https://www.atptour.com/en/players/andy-andrade/ag08/overview) |
| Jay Friend | 210221 | JPN | 2003-12-22 | [ATP](https://www.atptour.com/en/players/jay-friend/h0jl/overview) |
| Igor Marcondes | 127108 | BRA | 1997-06-16 | [ATP](https://www.atptour.com/en/players/igor-marcondes/rd48/overview) |
| Santiago Rodriguez Taverna | 144973 | ARG | 1999-07-16 | [ATP](https://www.atptour.com/en/players/-/RH59/overview) |
| Ignacio Parisca Romera | 212306 | VEN | 2005-08-20 | [ATP](https://www.atptour.com/es/players/ignacio-parisca-romera/p0i5/overview) |
| Younes Lalami | 207794 | MAR | 2001-04-18 | [ATP](https://www.atptour.com/en/players/younes-lalami/l0ck/overview), comprobado en la revisión previa de nombres |
| Guto Miguel | 213036 | BRA | 2009-02-26 | [ATP](https://www.atptour.com/es/players/guto-miguel/m0wy/overview) |
| Juncheng Shang | 209992 | CHN | 2005-02-02 | [ATP](https://www.atptour.com/players/juncheng-shang/s0re/overview); se evita el registro local con nacimiento 2005-01-01 |

## Validación de identidades en cada carga de rankings

La consolidación lee los snapshots fechados CSV y XLSX de `atp_rankings7` o `atp_rankings`. Aplica `cleaning.normalize_player_name` antes de asignar IDs y valida un ID ya presente contra el nombre del catálogo. Solo acepta coincidencias inequívocas; no asigna IDs mediante similitud de texto.

Los puestos empatados con sufijo `T` se convierten a su valor numérico sin eliminar a ninguno de los jugadores. El parser anterior descartaba 897 filas del snapshot del 21 de septiembre de 2026 por ese sufijo.

Cada consolidación escribe `ranking_identity_validation.csv` junto a sus demás salidas derivadas. En esta revisión está en `data/processed/web-audit-fixes/`. El informe conserva fecha de ranking, fichero, fila de origen (incluye la cabecera), nombre original y normalizado, ID recibido, ID resuelto y candidatos del catálogo. No modifica los rankings originales.

La recarga habitual del escritorio lo dejará en `data/processed/refresh/final/ranking_identity_validation.csv`.

Estados del informe:

- `name_corrected`: alias o normalización aplicada con ID resuelto.
- `unmatched_name`: no existe una coincidencia segura en el catálogo.
- `ambiguous_name`: el nombre corresponde a candidatos distintos y necesita comprobarse con país y nacimiento en ATP.
- `unknown_id` o `id_name_conflict`: el ID recibido no se reconoce o no corresponde al nombre.
- `country_conflict`: los códigos de país de tres letras discrepan.
- `birth_date_conflict`: el nacimiento recibido discrepa o no se puede interpretar.
- `duplicate_player_id`: filas contradictorias del mismo snapshot intentan usar el mismo ID. Se dejan sin enlace para no asociarlas a un perfil incorrecto; las copias exactamente iguales de un snapshot CSV/XLSX se deduplican.

Si quedan jugadores sin ID en el último ranking, el manifiesto recoge `web_atp_unresolved_latest` y la carga emite un aviso con la ruta del informe. Las consultas ATP que devuelven 403, Cloudflare o una ficha sin datos quedan pendientes; no se inventan identificadores ni nacimientos.

Resultado del 21 de septiembre de 2026: 2.291 jugadores conservados, 2.132 IDs resueltos y 159 pendientes (128 sin coincidencia y 31 ambiguos). Se registran 64 correcciones de nombre. El número de pendientes incluye ahora jugadores con puesto empatado que antes se descartaban. No significa que esos jugadores se hayan eliminado: siguen visibles en la tabla, sin enlace a un perfil incierto.

## Archivos de código modificados

- `src/tennis_pipeline/consolidation.py`: rankings, validación de identidades, resúmenes sin duplicados y fechas contrastadas.
- `src/tennis_pipeline/cleaning.py`: correcciones de nombres verificadas.
- `src/tennis_pipeline/scraping_functions.py`: conserva el día real cuando está disponible y comparte las correcciones de nombres.
- `src/tennis_pipeline/match_statistics.py`: prioriza el día real del partido.
- `web/components/rankings/AtpRankingsBoard.tsx`: claves de fila únicas.
- `web/components/players/PlayerProfileView.tsx`: limita la tabla al ancho de la tarjeta móvil.
- `web/components/tournaments/TournamentMatchStatisticsDetail.tsx` y `web/lib/matches/statistics-presentation.ts`: dirección correcta de la ventaja ATP.
- `tests/test_web_data_audit_fixes.py` y `web/lib/matches/statistics-presentation.test.ts`: regresiones de estos cambios.

Se regeneran `data/processed/web-audit-fixes` y los CSV, JSON y particiones publicados en `web/public/data`. La tabla de fechas verificadas está en `data/processed/match_date_corrections.csv`. No se modifican `data/raw`, los originales ni las muestras.

## Validación

141 pruebas Python correctas. Compilación de producción Next.js 14.2.35 correcta. Pruebas web: 43 de scripts y 5 de presentación/manifiesto, todas correctas. La actualización de Next.js no forma parte de estas correcciones de datos.

Navegador local Chromium mediante Playwright: 29 snapshots de rankings, 51 páginas de estadísticas con 672 valores, 8 predicciones y 10 perfiles. Los 66 cuadros conservan sus rondas y filas, se amplían por encima del pie, contienen el foco y se cierran con Escape. Vista móvil 390 × 844 y escritorio 1440 × 1000. El fallo de red de estadísticas muestra su aviso y el botón Retry recupera la página.

Se cotejan 14.390 valores numéricos con la fuente de estadísticas sin diferencias. Se conservan 3.400 partidos de torneos y 2.707 fichas de estadísticas, 146 de ellas sin estadísticas oficiales disponibles. Las pruebas de contrato no certifican por sí solas que todas las fechas del histórico sean fechas reales de juego. Corregir el día real cambia las URLs de detalle que incorporaban la fecha incorrecta.
