# Fechas de partidos contrastadas — 30/09/2026

La tabla derivada `data/processed/match_date_corrections.csv` contiene 17 fechas
de 2026 contrastadas mediante resultados y crónicas ATP. Se añadieron las trece
filas siguientes a las cuatro correcciones anteriores de Brisbane, Australian
Open y Wimbledon. El código exige coincidencia única de torneo, ganador,
perdedor, ronda y marcador, y rechaza temporadas incompatibles.

| Partido | Fecha de inicio contrastada | Fuente ATP |
| --- | --- | --- |
| Hong Kong, Bublik–Musetti, final | 11/01/2026 | [Crónica](https://www.atptour.com/en/news/musetti-bublik-hong-kong-2026-sunday) |
| Adelaide, Machac–Humbert, final | 17/01/2026 | [Crónica](https://www.atptour.com/en/news/humbert-machac-adelaide-2026-final-saturday) |
| Auckland, Mensik–Baez, final | 17/01/2026 | [Crónica](https://www.atptour.com/en/news/mensik-baez-auckland-2026-final) |
| Dallas, Shelton–Fritz, final | 15/02/2026 | [Crónica](https://www.atptour.com/en/news/fritz-shelton-dallas-2026-final) |
| Doha, Alcaraz–Fils, final | 21/02/2026 | [Crónica](https://www.atptour.com/en/news/alcaraz-fils-doha-2026-final) |
| Acapulco, Cobolli–Tiafoe, final | 28/02/2026 | [Crónica](https://www.atptour.com/en/news/cobolli-tiafoe-acapulco-2026-final) |
| Indian Wells, Sinner–Medvedev, final | 15/03/2026 | [Resultados](https://www.atptour.com/en/news/indian-wells-2026-results) |
| Miami, Sinner–Lehecka, final | 29/03/2026 | [Crónica](https://www.atptour.com/en/news/sinner-lehecka-miami-2026-final) |
| Montecarlo, Sinner–Alcaraz, final | 12/04/2026 | [Crónica](https://www.atptour.com/en/news/alcaraz-sinner-monte-carlo-2026-final) |
| Barcelona, Fils–Rublev, final | 19/04/2026 | [Resultados](https://www.atptour.com/en/news/barcelona-2026-results) |
| Madrid, Sinner–Zverev, final | 03/05/2026 | [Resultados](https://www.atptour.com/en/news/madrid-2026-results) |
| Roma, Sinner–Medvedev, semifinal | 15/05/2026 | [Suspensión y reanudación](https://www.atptour.com/en/news/sinner-medvedev-rome-2026-sf-saturday) |
| Roma, Sinner–Ruud, final | 17/05/2026 | [Resultados](https://www.atptour.com/en/news/rome-2026-results) |

La crónica de Acapulco se publicó el 1 de marzo, pero describe la final del sábado:
se conserva el 28 de febrero, sin sustituirlo por la fecha de publicación. En Roma,
el día de inicio de la semifinal es el viernes 15; el resultado final estuvo
disponible el sábado 16. Ambos hechos se conservan por separado en la evidencia.

No se infieren días a partir de una ronda, del calendario previsto ni del inicio
del torneo. La final de US Open sigue sin fecha individual contrastada: el horario
previsto por sí solo no prueba cuándo se disputó.

## Aplicación local y límites

Las correcciones se aplican a cuadros, estadísticas y enlaces de detalle locales.
Se regeneran los perfiles, la forma reciente y el historial de partidos usando
las mismas funciones de consolidación. Los balances de victorias y derrotas no
cambian. La copia web procede de esos derivados; no se vuelve a descargar ATP.

El verificador web pasa con 2.725 partidos con estadísticas y 227 sin información
disponible. Se preservan sus marcadores `n/a` al releer CSV. La comprobación con
Playwright revisó los 17 detalles afectados y tres visitas adicionales en móvil:
fecha visible correcta, enlaces con respuesta 200 y ningún error de consola ni
desbordamiento horizontal. Las 15 pruebas de los controles de auditoría pasan;
la suite completa de 170 pruebas ya estaba validada y no cambió código productivo.

La fuente anual sigue con 2.952 filas sin fecha individual verificada en raw. Hay
17 correcciones aparte y 2.935 partidos de esa temporada sin día contrastado en
esta tabla. La evidencia de disponibilidad del resultado se amplía en un partido,
pero no rellena automáticamente el contrato del entrenamiento. Las crónicas no
aportan timestamps y zonas horarias completos de todas las entradas. Tampoco
verifican el contexto histórico de los jugadores ni la procedencia de cada ranking.

El historial Elo heredado y sus métricas no se recalculan con una cronología
parcial. No se ha entrenado un modelo estricto ni ejecutado una recarga mensual.
`data/raw` y el modelo activo conservan sus huellas. Los datasets completos y los
hechos de la auditoría permanecen locales, fuera de Git.

Evidencia local, excluida de Git, en `data/processed/audit-2026-09-29`:

- `additional_match_date_evidence.json`: fuentes, fechas y fecha anterior.
- `additional_date_regeneration.json`: salidas regeneradas y balances intactos.
- `match_date_coverage.json`: cobertura y requisitos temporales aún pendientes.
- `derived_regeneration_validation.json`: coincidencias de las 17 correcciones
  y huellas de catálogo y modelo.

Véase la [auditoría temporal](validacion-temporal-estricta.md) para la transición
que todavía exige entradas verificadas antes de usar `strict-pre-match-v2`.
