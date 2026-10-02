# Revisión de identidades ATP — 30/09/2026

Se revisaron primero las 163 identidades pendientes del ranking local del 28/09.
El buscador ATP devuelve 403 para sus consultas, pero el ranking oficial ofrece
los enlaces exactos y Chrome normal minimizado carga las fichas. Se respetaron
pausas y cierres del navegador; no se descargaron nuevamente partidos ni torneos.

Cada ficha se contrastó con el catálogo por nombre, país IOC y nacimiento exacto.
Las coincidencias solo por parecido o por país/nacimiento con un nombre ajeno
quedan pendientes salvo que ATP vincule ambos nombres con el mismo código de ficha.
Los hechos contrastados se guardan después de cada consulta,
sin HTML completo, cookies o credenciales.

## Resultado

- 163 fichas verificadas; 76 identidades resueltas mediante alias e IDs existentes.
- 76 jugadores ausentes propuestos con IDs consecutivos 214589–214664.
- La propuesta inicial completa el nacimiento 20060313 del ID 213983, Maximilian
  Alessandro Erhardt, y resuelve 153 de 163 casos, con 10 pendientes.
- La ampliación aprobada añade tres nacimientos contrastados para IDs existentes:
  Carles Cordoba, Jerry Roddick y Timeo Trufelli. Mantiene las mismas 76 altas.
- Tras autorización expresa del usuario se aplicaron las 76 altas y cuatro
  nacimientos, preservando todas las demás columnas y filas originales.
- El catálogo resuelve ahora 156 de 163 casos. El ranking del 28/09 tiene 2.290
  filas, siete IDs pendientes y ninguna colisión entre filas; antes tenía 87 pendientes.

Las dos correspondencias adicionales conservan IDs del catálogo: Pawel Juszczak
se enlaza con Pawel Cias (109318, POL, 19940222), y Barkat Ullah con Barkat Khan
(208397, PAK, 19980301). Además de país y nacimiento, ATP usa el mismo código
CF60/K0EN en las URLs de ambos nombres. Véanse la
[ficha bajo el nombre Cias](https://www.atptour.com/en/players/pawel-cias/cf60/overview),
la [ficha Juszczak](https://www.atptour.com/en/players/pawel-juszczak/cf60/overview),
la [ficha Khan](https://www.atptour.com/en/players/barkat-khan/k0en/overview) y
la [ficha Ullah](https://www.atptour.com/en/players/barkat-ullah/k0en/overview).
Se exige que el catálogo siga coincidiendo en país y nacimiento; el alias no
permite aceptar datos incompatibles. Las pruebas cubren ambos cargadores de partidos.

## Vínculos adicionales por ranking histórico

Se revisaron 73 archivos locales con 3.351.427 filas. Los partidos no aportaban
vínculos para los candidatos ambiguos. Entre los rankings se encontró un puesto
y puntuación únicos para tres IDs, contrastados después directamente con ATP.
El selector de fecha y el código de ficha coinciden con los perfiles ya verificados
por país y nacimiento. La unicidad se exige en ambas fuentes; los empates no sirven
para decidir una identidad.

| Jugador | ID existente | País | Nacimiento | Fecha de ranking | Puesto / puntos |
| --- | --- | --- | --- | --- | --- |
| Carles Cordoba | 213059 | ESP | 18/01/2006 | 25/05/2026 | 917 / 24 |
| Jerry Roddick | 212542 | USA | 21/06/2002 | 25/05/2026 | 1134 / 11 |
| Timeo Trufelli | 212770 | FRA | 20/02/2008 | 04/05/2026 | 1247 / 8 |

Fuentes: [ranking ATP del 25 de mayo](https://www.atptour.com/en/rankings/singles?dateWeek=2026-05-25&rankRange=0-5000),
[ranking del 4 de mayo](https://www.atptour.com/en/rankings/singles?dateWeek=2026-05-04&rankRange=0-5000),
[Cordoba](https://www.atptour.com/en/players/carles-cordoba/c0oi/overview),
[Roddick](https://www.atptour.com/en/players/jerry-roddick/r0jg/overview) y
[Trufelli](https://www.atptour.com/en/players/timeo-trufelli/t0jj/overview).

Se preparó y validó la ampliación fuera de raw antes de recibir permiso; no se elige un duplicado por su orden ni
se fusionan los otros IDs. El índice solo acepta los IDs contrastados si su país
y nacimiento coinciden, por lo que los nacimientos vacíos siguen sin resolver.
Las dos pruebas nuevas cubren esta condición en ambos cargadores; pasan las 177
pruebas Python. No se ha ejecutado una recarga ni sustituido el modelo.

Siguen sin correspondencia inequívoca Jakub Vrba, James Weber, Hugo Cardinaud,
Claus Piening, Philippe Renard, Leon Peranovic y Alvaro Jimenez. La presencia de
un solo candidato en un fichero no demuestra una identidad. Tampoco basta compartir
país y nacimiento cuando los códigos ATP corresponden a perfiles distintos.

Un sufijo explícito como Julian Alonso Jr tiene una identidad verificada propia;
no identifica automáticamente a Julian Alonso sin sufijo. Los cargadores de
partidos terminados, futuros y rankings comparten el índice y la normalización,
incluidas mayúsculas, espacios y puntuación. Los duplicados con los mismos datos
contrastados conservan un ID existente; los homónimos con datos distintos no se
eligen por orden del CSV.

## Propuesta local y protección del original

Archivos en `data/processed/audit-2026-09-29`, excluidos de Git:

- `atp_profile_evidence.json`: país, nacimiento, ficha y momento de consulta.
- `atp_name_bridge_evidence.json`: nombres antiguos/actuales, código ATP y fuentes.
- `identity_catalogue_review.json`: candidatos y motivo de resolución o duda.
- `atp_players_change_proposal.csv`: cambios concretos y fuente de cada uno.
- `atp_players.proposed.csv`: catálogo completo propuesto, con las ocho columnas
  originales; los nombres nuevos permanecen completos en `name_first` y el
  apellido vacío cuando no existe separación fiable.
- `catalogue_proposal_validation.json`: validación de país/nacimiento y colisiones.
- `atp_players.expanded-proposed.csv` y `atp_players_expanded_change_proposal.csv`:
  catálogo y 80 cambios de la propuesta ampliada; la propuesta inicial se conserva.
- `atp_players_expanded_change_proposal.json`: integridad de todas las columnas,
  resolución de 156 casos, siete pendientes y condiciones de autorización.
- `historical-ranking-link-evidence*.json`: fechas seleccionadas, códigos de ficha
  y puestos/puntos únicos contrastados; los historiales completos no se publican.

El usuario autorizó expresamente la propuesta ampliada con «Autorizo la propuesta».
Se verificaron las huellas de original y propuesta y se guardó una copia íntegra
en `data/processed/audit-2026-09-29/backups/atp_players.before-approved-expanded-2026-09-30.csv`.
La sustitución del CSV fue atómica. Los 66.871 registros originales conservan sus
campos salvo los cuatro nacimientos vacíos aprobados; el catálogo pasa a 66.947 filas.
Esta autorización es una excepción concreta a `AGENTS.md`; no habilita otras ediciones
manuales de `data/raw`. No se publica el catálogo completo ni se cambian modelos.

Se regeneraron `players.csv`, los rankings e informe de identidades, los perfiles,
los rankings de jugadores y el directorio, siete CSV en total, junto con el
manifiesto. Las 80 filas afectadas están enlazadas en ranking, perfiles y directorio.
Se conservaron los balances de todos los perfiles anteriores y las huellas de
partidos, historial Elo, predicciones y modelo. La copia web se actualizó y pasó
el verificador: cero errores críticos y cuatro avisos preexistentes. Se reconstruyó
Next.js para renovar también los rankings prerenderizados.

Chrome oculto comprobó los 80 perfiles afectados, seis búsquedas y enlaces desde
el ranking y seis perfiles a 390×844, sin errores de consola ni desbordamiento
horizontal. La evidencia está en `approved-profile-route-verification.json`.

Evidencias de aplicación y regeneración: `approved-catalogue-application.json` y
`approved-catalogue-derived-verification.json`. Las copias previas de los derivados
están en `backups/derived-before-approved-catalogue`. No se ha relanzado la mensual.

Para revertir el catálogo, solicitar autorización y restaurar su copia previa;
después regenerar los derivados, exportar los datos web y volver a compilar Next.js.
Revertir un cambio de frontend no requiere restaurar catálogo, partidos ni modelo.

## Archivos de implementación local

El 30/09 el usuario autorizó subir todos los cambios pendientes de `main`,
incluida la copia de presentación en `web/public/data/`. Esta entrega incorpora
el ranking del 28/09 y los enlaces de las 80 identidades contrastadas. El catálogo
raw, los respaldos y la evidencia detallada conservan sus exclusiones de Git.

`cleaning.py` reúne alias e identidades contrastadas; `consolidation.py` valida
country/DOB y respeta el alias del hijo; `scraping_functions.py` utiliza el mismo
índice; `scraping.py` valida la ficha ATP. El script de revisión reanudable y las
pruebas permanecen privados conforme a las exclusiones del repositorio.

Referencias: [ranking ATP](https://www.atptour.com/en/rankings/singles?dateWeek=Current+Week&rankRange=0-5000),
[ficha de Andres Martin](https://www.atptour.com/en/players/andres-martin/m0np/overview).


## Revisión del 02/10/2026

Se recalculó el informe con el catálogo actual (66.947 filas), leyendo las dos
columnas de nombres y reutilizando la normalización compartida: 67.702 registros
de ranking en 30 fechas. El último snapshot, 28/09, conserva 2.290 filas,
siete jugadores sin ID y cero colisiones entre IDs resueltos. No se repiten las
altas ni las cuatro correcciones de nacimiento ya autorizadas.

| Pendiente | IDs locales candidatos | Motivo pendiente |
| --- | --- | --- |
| Jakub Vrba | 149107, 213551 | Duplicados sin nacimiento; historia de ranking insuficiente para elegir |
| James Weber | 115238, 214062 | Duplicados sin nacimiento |
| Hugo Cardinaud | 212172, 213220 | Duplicados sin nacimiento |
| Claus Piening | Sin coincidencia exacta | País/nacimiento coinciden con Markus Malaszszak, pero no prueban identidad |
| Philippe Renard | 213079, 213099 | Duplicados; compartir nacimiento con Lucas Schurdevin no demuestra alias |
| Leon Peranovic | 213086, 213110 | Duplicados sin nacimiento ni enlace histórico inequívoco |
| Alvaro Jimenez | 213077, 213097 | Duplicados; otro apellido en fuente secundaria requiere un puente verificable |

Se reutiliza la evidencia ATP anterior y se consulta primero el CSV. Las consultas
actuales de seis fichas ATP devuelven 403 y la de Cardinaud devuelve contenido
incompleto. No se intenta eludir el bloqueo. Las fuentes independientes revisadas,
incluidas las fichas de [Vrba](https://www.tennis.com/players-rankings/jakub-vrba) y
[Renard](https://www.tennis.com/players-rankings/philippe-renard), corroboran datos
públicos del jugador, pero no la correspondencia con un ID local duplicado.

No hay nuevas altas o correcciones concretas preparadas para aplicar: falta evidencia,
no permiso. El catálogo queda intacto. Informe recalculado y decisiones en
`data/processed/audit-2026-10-02/ranking_identity_validation.csv`,
`identity-recheck.json` e `identity-evidence-review.json`, excluidos de Git.
