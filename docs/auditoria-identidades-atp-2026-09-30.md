# Revisión de identidades ATP — 30/09/2026

Se revisaron primero las 163 identidades pendientes del ranking local del 28/09.
El buscador ATP devuelve 403 para sus consultas, pero el ranking oficial ofrece
los enlaces exactos y Chrome normal minimizado carga las fichas. Se respetaron
pausas y cierres del navegador; no se descargaron nuevamente partidos ni torneos.

Cada ficha se contrastó con el catálogo por nombre, país IOC y nacimiento exacto.
Las coincidencias solo por parecido o por país/nacimiento con un nombre ajeno
quedan pendientes. Los hechos contrastados se guardan después de cada consulta,
sin HTML completo, cookies o credenciales.

## Resultado

- 163 fichas verificadas; 74 identidades resueltas mediante alias e IDs existentes.
- 76 jugadores ausentes propuestos con IDs consecutivos 214589–214664.
- Una actualización propuesta: nacimiento 20060313 del ID 213983, Maximilian
  Alessandro Erhardt. Las demás columnas de esa fila se conservan.
- 12 casos siguen pendientes: ocho nombres con dos IDs y nacimiento vacío, y
  cuatro variantes cuyos nombres no permiten confirmar la correspondencia.
- La propuesta completa resuelve 151 de 163 casos. El ranking resultante tiene
  2.290 filas, 12 IDs pendientes y ningún ID enlazado a dos filas del mismo snapshot.

Un sufijo explícito como Julian Alonso Jr tiene una identidad verificada propia;
no identifica automáticamente a Julian Alonso sin sufijo. Los cargadores de
partidos terminados, futuros y rankings comparten el índice y la normalización,
incluidas mayúsculas, espacios y puntuación. Los duplicados con los mismos datos
contrastados conservan un ID existente; los homónimos con datos distintos no se
eligen por orden del CSV.

## Propuesta local y protección del original

Archivos en `data/processed/audit-2026-09-29`, excluidos de Git:

- `atp_profile_evidence.json`: país, nacimiento, ficha y momento de consulta.
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
