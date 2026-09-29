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
- Una actualización propuesta: nacimiento 20060313 del ID 213983, Maximilian
  Alessandro Erhardt. Las demás columnas de esa fila se conservan.
- 10 casos siguen pendientes: ocho nombres con dos IDs y nacimiento vacío, y
  dos variantes cuyos nombres no permiten confirmar la correspondencia.
- La propuesta completa resuelve 153 de 163 casos. El ranking resultante tiene
  2.290 filas, 10 IDs pendientes y ningún ID enlazado a dos filas del mismo snapshot.

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

`data/raw/atp_players.csv` conserva su huella original. Aplicar la propuesta exige
permiso explícito como excepción a la protección de `AGENTS.md`. No se publica
el catálogo completo ni se cambian modelos. Las identidades ya resueltas se
incorporan a los derivados, sin depender de aprobar las altas.

## Archivos de implementación local

`cleaning.py` reúne alias e identidades contrastadas; `consolidation.py` valida
country/DOB y respeta el alias del hijo; `scraping_functions.py` utiliza el mismo
índice; `scraping.py` valida la ficha ATP. El script de revisión reanudable y las
pruebas permanecen privados conforme a las exclusiones del repositorio.

Referencias: [ranking ATP](https://www.atptour.com/en/rankings/singles?dateWeek=Current+Week&rankRange=0-5000),
[ficha de Andres Martin](https://www.atptour.com/en/players/andres-martin/m0np/overview).
