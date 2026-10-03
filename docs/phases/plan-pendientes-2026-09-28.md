# Plan de acción de ATP Insight

Fecha: 28/09/2026. Revisión: 03/10/2026. Estado: Next.js publicado; contrato temporal V3
implementado y probado en local; catálogo ampliado con autorización y seis identidades pendientes de un vínculo documental.
Objetivo: completar los pendientes técnicos y de datos, una etapa cada vez, con
resultados verificables. La app de escritorio está terminada y aceptada por el usuario.

## Límites y forma de trabajo

- La recarga mensual queda fuera: el usuario la ejecuta manualmente. No lanzarla
  ni programarla, no sustituir modelos activos ni interrumpir descargas.
- Antes de cada etapa comprobar si hay una recarga activa. Aislar la migración y
  sus dependencias; no cambiar el entorno que esté usando la carga. Integrar solo
  cuando sea seguro y después de verificar el resultado.
- Mantener los cambios existentes. No modificar scripts originales, notebooks,
  muestras ni archivos de `data/raw/` manualmente. Leer el catálogo está permitido;
  preparar las altas fuera de esa carpeta y pedir permiso específico antes de
  incorporar cambios al CSV original.
- Reutilizar el código existente siguiendo ponytail. Añadir solo lo necesario.
- Ejecutar pruebas pertinentes, documentar evidencia y actualizar este plan al
  cerrar cada etapa. No confundir una prueba simulada con una recarga real.
- Autorización actualizada del usuario: subir cambios a GitHub y publicarlos por
  bloques siempre que estén validados, sin pedir confirmación para cada entrega.
  Revisar el diff, excluir secretos, raw, derivados de trabajo y modelos, y publicar
  solo archivos del bloque comprobado. El 30/09 autorizó también la copia pública
  renovada de `web/public/data/` en `main`. Respetar las protecciones de la rama.
- Tras cada publicación, comprobar el despliegue de Vercel del mismo commit,
  su estado y registros pertinentes, y probar las rutas principales de la web.
  No dar una publicación por correcta únicamente porque terminó el push.

## 1. Migración de Next.js — primera tarea

Punto de partida comprobado: Next.js instalado y bloqueado en 14.2.35; React 18.3.1.
La última estable consultada en npm es 16.3.6. Volver a consultar la versión al
comenzar: no fijar como objetivo permanente una versión que pueda quedar antigua.

Acciones:

1. Registrar versiones, configuración, pruebas y estado de compilación actuales.
   Preparar un entorno separado para no afectar a la mensual del usuario.
2. Revisar las guías oficiales de migración y compatibilidad de Node, React,
   TypeScript y librerías usadas; identificar cambios necesarios en rutas,
   parámetros asíncronos, caché y configuración del compilador.
3. Actualizar dependencias y lockfile; adaptar solamente las incompatibilidades
   reales. Comprobar también los comandos de compilación usados por la recarga.
4. Ejecutar pruebas web, tipos, contratos de datos y compilación de producción.
   Revisar inicio, torneos, cuadros ampliados, detalle de partidos, rankings,
   perfiles, comparador y página del modelo en escritorio y móvil.

Cierre: versión estable objetivo instalada, compilación y pruebas correctas,
rutas revisadas, cambios y reversión documentados. No integrar sobre una carga activa.

## 2. Identidades de jugadores

Punto de partida: 163 identidades sin resolver en el último ranking comprobado.
Recalcular el informe al comenzar porque una recarga puede cambiar ese número.

Acciones:

1. Leer `ranking_identity_validation.csv` y agrupar casos únicos, priorizando
   jugadores presentes en rankings recientes, torneos y predicciones.
2. Buscar primero en ambas columnas del CSV, incluidos nombres completos en una
   sola columna, iniciales y alias existentes.
3. Si sigue sin ser inequívoco, contrastar la ficha ATP con país y nacimiento.
   Guardar fuente y motivo de cada resolución. No asignar por similitud solamente.
4. Incorporar alias confirmados a la función compartida; preparar altas con el
   siguiente ID local libre y la estructura del catálogo. Escribir en el CSV de
   `data/raw/` únicamente después de recibir permiso específico.
5. Validar rankings y cruces de partidos; regenerar derivados solo explicando las
   salidas que se reemplazan y sin competir con una recarga activa.

Cierre: casos verificables corregidos, sin colisiones ni homónimos enlazados;
informe con resueltos y pendientes reales. No exigir cero pendientes inventando datos.

## 3. Fechas reales de partidos históricos

Acciones:

1. Inventariar partidos con fecha no contrastada; priorizar perfiles, forma
   reciente y partidos que afectan al orden temporal de las variables predictivas.
2. Reutilizar fechas ATP verificables y la tabla derivada de correcciones; no
   deducir el día solo por la ronda o el inicio del torneo.
3. Documentar fuente y coincidencia única por partido. Si ATP impide verificar,
   conservar el caso pendiente sin forzar accesos ni afirmar una fecha exacta.
4. Regenerar derivados autorizados y comprobar cronología, ausencia de duplicados,
   balances, cuadros y enlaces de detalle afectados por cambios de fecha.

Cierre: cobertura medida, correcciones trazables, incertidumbres explícitas y
enlaces internos coherentes. Ningún cambio manual en `data/raw/`.

## 4. Validez temporal del modelo

Acciones:

1. Seguir el recorrido de cada variable desde la fuente hasta entrenamiento y
   predicción, empezando por Elo y los indicadores posteriores al partido del
   modo heredado. Diferenciar riesgos documentados de fugas demostradas.
2. Corregir el cálculo para utilizar solo información disponible antes del partido;
   probar orden, actualización del estado, fechas inciertas y partidos del mismo día.
3. Separar selección/calibración del periodo final de evaluación. Definir cortes
   temporales reproducibles y comparación de candidatos con las mismas métricas.
4. Implementar y probar el contrato corregido en salidas aisladas. Versionar las
   variables para evitar alimentar al modelo actual con un esquema incompatible.
5. Documentar qué requiere un nuevo entrenamiento manual y cómo verificarlo.
   Mantener las métricas actuales identificadas como heredadas hasta contar con
   una evaluación comparable; no afirmar mejoras sin calcularlas.

Cierre de código: pruebas de causalidad temporal y contratos correctas, metodología
documentada y transición preparada. Entrenamiento mensual y nuevas métricas quedan
a cargo de la ejecución manual del usuario, fuera de este goal.

## 5. Publicación y verificación en Vercel

Acciones:

1. Repetir la auditoría integrada tras las correcciones: rutas, datos, errores,
   móvil, accesibilidad básica y compilación de producción.
2. Comprobar versiones y frescura de datos/modelo, documentar límites pendientes
   y revisar qué archivos se publicarían, sin incluir datos privados ni modelos.
3. Preparar lista concreta de cambios, pruebas y procedimiento de reversión.
4. Subir y publicar el bloque validado con la autorización ya concedida. Puede
   hacerse al cerrar cada etapa independiente; no es necesario esperar al final.
5. Confirmar en Vercel el commit desplegado y la finalización correcta; comprobar
   la web publicada y registrar URL, versión, resultado y cualquier incidencia.

Cierre: entrega publicada y verificada. Si falta acceso al alojamiento, documentar
exactamente la comprobación pendiente y solicitar solo el acceso necesario.

## Seguimiento histórico — cierre del 30/09

| Etapa | Estado | Evidencia de cierre |
| --- | --- | --- |
| Next.js | Completada y publicada | Next.js 16.3.6, React 19.3.0, Node 24; 61 pruebas locales, 30 versionadas, build local y Vercel correctos; PR #1 |
| Identidades | Cambios verificables aplicados con permiso; siete casos no verificables documentados | 163 fichas contrastadas; 76 altas (214589–214664) y nacimientos de IDs 213983, 213059, 212542 y 212770 aplicados. 156 casos resueltos, siete pendientes y ninguna colisión en 2.290 filas del ranking; backup del original y derivados regenerados |
| Fechas históricas | Auditoría y correcciones trazables verificadas; cobertura histórica parcial | 2.952 filas anuales y 26 archivos sin fecha real; 45 fechas contrastadas y 2.907 días pendientes. Revisadas las 32 finales prioritarias restantes: 28 contrastadas y cuatro pendientes con motivo documentado. Inicio y conclusión separados para Roma y Eastbourne. Cinco derivados y copia web ampliados, balances intactos y 51 visitas QA. La cronología completa sigue sin verificarse |
| Validez temporal del modelo | Código V3 implementado y validado; datos históricos pendientes | Base UTC común obligatoria, Elo previo, disponibilidad individual de resultados nocturnos, metadatos de ranking/contexto, CV/calibración purgadas y prueba final separada; 178 pruebas Python. No se ha entrenado ni activado un modelo estricto |
| Publicación y Vercel | Next y aviso de métricas publicados y verificados | Next: PR #1 y 31 visitas QA. Aviso heredado: commit 0498a20, Vercel success, `/model` y `/feature-importance` revisados en escritorio/móvil y filtro Elo sin errores |
| Recarga mensual | Excluida: ejecutada por el usuario | Estado local success, finalizada el 28/09 a las 20:25; no relanzada por Codex |

Referencias del diagnóstico: `docs/correcciones-auditoria-web.md`,
`docs/recarga-app-escritorio.md`, `docs/limitations.md` y `docs/modeling.md`.

Evidencia del primer bloque: `docs/nextjs-16-migration.md` y
[PR #1](https://github.com/jandrogv/tennis-atp-predictor/pull/1).
Auditoría posterior: `docs/validacion-temporal-estricta.md`. El código Python y sus
pruebas permanecen privados según `.gitignore`; solo se publica su documentación.
Siguiente etapa de datos: obtener evidencia independiente de los siete casos aún
ambiguos y completar fechas y procedencia trazables antes de la
transición manual al contrato estricto. No se da por corregida la cronología
histórica ni se presentan métricas nuevas a partir de pruebas simuladas.

Revisión de cierre del 30/09: 178 pruebas Python, 63 pruebas web, verificador de
datos y compilación correctos; 31 visitas locales con interacciones y móvil.
La caché de snapshots de ranking se actualiza si cambia la fuente, conservando
los archivos realmente inalterados. El modelo mantiene su huella; el catálogo raw
se amplió únicamente con los 80 cambios expresamente autorizados, con copia previa.
La primera publicación incluyó el aviso del modelo y documentación. La autorización
posterior del 30/09 permite incorporar los 105 archivos públicos renovados pendientes
en `main`, con el ranking del 28/09, las identidades y las 45 fechas contrastadas.
Raw, derivados de trabajo y modelos siguen fuera de Git. Véase
`docs/auditoria-identidades-atp-2026-09-30.md` para la aplicación del catálogo y su reversión local.

El contrato V3 rechaza fechas con base local o ausente y artefactos V1/V2. Conserva
la declaración UTC desde el CSV hasta la evaluación y la registra en el manifiesto
de entrenamiento. Las fechas ATP usadas en la presentación no se convierten en
entradas UTC verificadas sin evidencia suficiente; el modelo operativo no cambia.

Ampliación final del 30/09: corregida la lectura de `n/a` en la función compartida
de fechas. Se reproducía y pasaba una fecha incorrecta en partidos sin estadísticas;
la nueva prueba falla antes del arreglo y pasa después. Incorporadas 28 fechas ATP
adicionales: 27 cambian de día y Roland Garros conserva su día ahora contrastado.
La ampliación no se aplica a Elo, entrenamiento ni predicciones heredadas. Reversión
local y fuentes en `docs/auditoria-fechas-partidos-2026-09-30.md`.


## Estado actual — 02/10/2026

La inspección partió de `main` limpio en `f47ab9f`. PR #1 ya estaba integrada y los
105 archivos públicos autorizados ya se habían publicado en `25c3dde`: no quedaba
pendiente repetir esa entrega. El cuadro aceptado por el usuario se conserva.

| Etapa | Estado actual | Evidencia de esta ejecución |
| --- | --- | --- |
| Next.js | Verificada de nuevo; sin otra migración | Versiones instaladas/lock coherentes; 65 pruebas web, tipos y build; 36 visitas locales y 72 comprobaciones del cuadro |
| Identidades | Parcial: siete casos dependen de evidencia | Recalculadas 30 fechas, 67.702 filas; última fecha 28/09, 2.290 filas, siete sin ID y cero colisiones. Sin nuevas modificaciones de raw |
| Fechas | Ampliación completada; historia parcial | 47 coincidencias únicas de 2.952, 2.905 pendientes. Dos partidos US Open añadidos; 227 `n/a` y todos los balances conservados |
| Temporal V3 | Código verificado; transición manual pendiente | 183 pruebas Python. Sin otro defecto reproducible. Faltan entradas UTC contrastadas y evaluación real; el modelo activo no cambia |
| Publicación | Publicada; estado y web verificados; logs internos sin acceso | Commit `7c8130d`, Vercel success, 36 visitas de producción, 72 comprobaciones del cuadro y ocho archivos públicos idénticos a la copia local |
| Mensual / escritorio | Fuera del alcance | Mensual del usuario finalizada el 28/09 a las 20:25:18; modelo activo correspondiente. App aceptada, sin modificaciones |

Se comprobó ausencia de procesos de recarga y disponibilidad del bloqueo antes de
integrar. Los 143 archivos protegidos de raw, modelos y predicciones conservan sus
huellas. Cinco derivados se calcularon aislados; solo se sustituyeron los tres CSV
que cambiaron, la tabla de correcciones y el manifiesto. La copia pública modifica
cinco archivos por fechas y el índice de torneos por sus dos estados vencidos.

El código privado solo amplía las fuentes oficiales admitidas para correcciones
manuales (ATP Finals y US Open). Cinco casos de regresión complementan la suite.
No se modifica scraping, entrenamiento, dependencias, interfaz ni escritorio.
La primera invocación de pytest sin directorio recorrió copias y carpetas históricas
con ACL; se ejecutó después la suite correcta `pytest tests -q`, con 183 aprobadas.
El verificador se ejecuta desde `web`; los cuatro avisos restantes son preexistentes.

Pendientes reales: evidencias de los siete IDs, 2.905 días de partido y procedencia
UTC/ranking/contexto del conjunto histórico. No hay una propuesta nueva de catálogo
suficientemente acreditada que justifique pedir permiso. La transición V3 no se
considera terminada ni se anuncia una mejora del modelo.

Reversión: para los datos locales, restaurar las rutas listadas en
`data/processed/audit-2026-10-02/date-integration.json` desde
`backups/before-date-integration` dentro de esa auditoría; el índice anterior está
junto a ella en `tournament-index-before.json`. Código y prueba privados tienen
respaldo en `code-backup` (la prueba lleva extensión `.bak`). Para producción,
revertir el commit de esta entrega y comprobar el nuevo despliegue. Nunca restaurar
raw ni modelos para revertir este bloque. Evidencia y salidas internas siguen ignoradas.


### Publicación comprobada

- [Commit 7c8130d](https://github.com/jandrogv/tennis-atp-predictor/commit/7c8130d54ff2efcae58d4e17a1adb32652b7da92), publicado directamente en `main` con autorización previa.
- [Despliegue Vercel del mismo commit](https://vercel.com/jandrogvs-projects/atpinsight/4aKLDZteG3cPzmnTJpRKamQGooi6): estado `success` confirmado mediante GitHub.
- [Producción](https://atpinsight-two.vercel.app): 36 visitas en escritorio/móvil y 72 comprobaciones geométricas/funcionales del cuadro en escritorio/tablet/móvil, todas correctas. Búsqueda ATP, navegación a perfil, selección de dos jugadores, filtro Elo y fechas de detalle comprobados; sin errores de consola ni overflow detectado.
- Ocho archivos descargados de producción coinciden con la versión local (normalizando únicamente CRLF): los seis públicos modificados, `web_model_summary.csv` y `web_match_cards.csv`. La web conserva el resumen y las predicciones del modelo de la mensual del 28/09.
- Límite de acceso: no se pudieron consultar configuración privada ni logs internos del despliegue. El navegador integrado falla al iniciar; no hay conector Vercel ni CLI autenticada. Se ha solicitado acceso de lectura o el registro de compilación; no se presenta el estado `success` como una lectura de esos logs.

Evidencia de esta ejecución en `data/processed/audit-2026-10-02`: logs de pruebas,
verificador y build, `publication.json`, `production-content-check.json` y
`final-protection-check.json`. Capturas y QA del navegador, fuera del repositorio,
usaron los prefijos `audit-oct2-local` y `audit-oct2-production`. Chrome instalado
en modo oculto mediante Playwright; no se han probado otros motores de navegador.
Para revertir la publicación de datos, `git revert 7c8130d` y validar el despliegue
resultante. El cierre documental posterior no cambia código ni datos públicos.

## Nueva fase de datos — 02/10/2026

Partida comprobada: `main` limpio en `374979f`, bloqueo disponible y sin proceso de
recarga. Inventario recalculado: siete identidades, 47 fechas únicas y 2.905 días
pendientes. Se reutilizan consolidación, normalización, correcciones y validadores;
no cambia código de producción, interfaz, cuadros, escritorio, Next.js ni dependencias.

| Bloque | Resultado actual | Siguiente paso concreto |
| --- | --- | --- |
| Identidades | Claus Piening añadido como 214665 con permiso específico; 66.948 jugadores, seis pendientes y cero colisiones en 2.290 filas del último ranking | Vincular documentalmente los IDs locales duplicados con las seis fichas oficiales; no elegir por similitud o frecuencia |
| Cronología | Seis fechas nuevas US Open; 53/2.952 verificadas, 2.899 pendientes; QF/SF/F completo y un R16 adicional | Continuar por ediciones con evidencia inequívoca, conservando inicio/conclusión y marcadores ausentes |
| Preparación V3 | 42 archivos anuales, 135.455 filas, 135.453 claves distintas; cero elegibles. Un inicio/final contrastados a precisión de minuto | Acreditar disponibilidad de resultados/estadísticas, ranking y contexto de un grupo acotado; no exige completar antes todas las fechas de presentación |
| Validación | 183 pruebas Python, 65 web, verificador y build aprobados; 26 visitas locales y cuatro recorridos de navegación, escritorio/móvil, sin errores ni desbordamientos | Comprobar publicación del mismo commit y rutas en producción |
| Mensual/modelo | Sin ejecución ni cambio; se conserva la mensual del 28/09 | Entrenamiento/activación V3 fuera del encargo |

El usuario autorizó exactamente `214665,Claus,Piening,R,20040708,GER,,` después de
revisar evidencia, diff, copia y reversión. Los bytes previos del catálogo no
cambian; los otros **142 archivos protegidos** conservan su huella. No quedan altas
propuestas sin aplicar. Los seis casos restantes necesitan evidencia, no otra
autorización genérica. Se distinguen los identificadores ATP, ITF, federativos y locales.

Se integran nueve CSV derivados, el manifiesto y la tabla de correcciones, más
14 archivos públicos: seis CSV generales, seis snapshots ATP, estadísticas y
partición US Open. Se conserva el formato numérico anterior para evitar diferencias
de serialización sin significado. Fuentes, decisiones y reversión en las auditorías
existentes de [identidades](../auditoria-identidades-atp-2026-09-30.md),
[fechas](../auditoria-fechas-partidos-2026-09-30.md) y
[V3](../validacion-temporal-estricta.md). Evidencia privada en
`data/processed/audit-2026-10-02-data-phase`.

El verificador conserva cuatro avisos preexistentes: experimento histórico con
enlaces ajenos a predicciones actuales y tres eventos por equipos sin campeón
individual. No se convierten en trabajo nuevo de UI. Por instrucción de esta fase,
la falta de acceso a logs privados de Vercel sigue explícita: no bloquea otras
comprobaciones ni se vuelve a pedir acceso.

QA local: Chrome instalado oculto mediante Playwright porque el plugin Browser no
está disponible. Se verifican identidad de página, contenido, ausencia de overlay,
consola, capturas, búsqueda ATP → perfil de Claus y selección de semifinal → detalle
corregido. Las seis fechas pasan en escritorio 1440×1000 y móvil 390×844, junto con
los cuatro perfiles cuya última fecha cambia. Evidencia fuera del repositorio con
prefijo `data-phase-local`; no se han probado otros motores.

### Publicación y cierre comprobados el 03/10

- [Commit de datos y documentación `ed27a06`](https://github.com/jandrogv/tennis-atp-predictor/commit/ed27a06750bf51c7e262d7c0afaead37bb1b1e6c), publicado en `main` tras revisar los 18 archivos: 14 públicos y cuatro documentos. Código, raw, modelos, auditorías privadas y salidas internas respetan `.gitignore`.
- [Vercel del mismo commit](https://vercel.com/jandrogvs-projects/atpinsight/GALxVgaZ7i1BQBqV5dgMYtKarrfZ): estado `success` confirmado mediante GitHub. No se consultaron logs internos por falta del acceso ya documentado; no se solicitó otro permiso.
- [Producción](https://atpinsight-two.vercel.app): 26 visitas en Chrome a 1440×1000 y 390×844, con cuatro recorridos de búsqueda ATP → perfil y semifinal del cuadro → detalle. Fechas, enlaces, título, contenido, consola, ausencia de overlay y desbordamientos comprobados; sin errores.
- Los 14 archivos públicos del bloque y los dos archivos operativos `web_model_summary.csv`/`web_match_cards.csv` descargados de producción coinciden con la copia local, normalizando solo CRLF. Se verificaron nuevamente las 143 huellas protegidas posteriores al alta autorizada; ninguna cambió durante el cierre.
- Se mantiene el resultado de 183 pruebas Python, 65 web, verificador y build correctos. No se repiten tests ni build por este cierre exclusivamente documental. Se detuvo únicamente el servidor local de QA creado por Codex.

Evidencia privada: `production-content-check.json`, `publication.json` y
`final-protection-check.json` en `data/processed/audit-2026-10-02-data-phase`.
QA y capturas fuera del repositorio con prefijos `data-phase-local` y
`data-phase-production`. La comprobación de rutas afectadas está terminada.
Para revertir producción, revertir `ed27a06` y verificar el despliegue resultante;
esa reversión no modifica el catálogo local. Para revertir los derivados, usar las
rutas y copias de `integration.json`; el catálogo requiere su procedimiento y
autorización específicos.

Pendientes de datos: seis identidades sin puente al ID local; 2.899 días locales
de partido; disponibilidad temporal de resultados/estadísticas, ranking y contexto
para V3. No hay un subconjunto actualmente elegible ni nuevas métricas. La siguiente
investigación debe priorizar un grupo acotado con procedencia temporal completa;
no presupone que sea necesario completar toda la presentación antes de obtenerlo.

## Piloto temporal histórico: revisión del 3 de octubre de 2026

Se terminó la investigación acotada de los cuatro cuartos, dos semifinales y final
del US Open 2026, partiendo de Shelton–Alcaraz. **La preparación de datos V3 sigue
pendiente: 7 partidos examinados, 0 elegibles y 7 rechazados.** No se entrenó,
calibró, activó, ejecutó ni programó ninguna recarga. El modelo y las predicciones
de la mensual del 28/09 siguen intactos.

| Comprobación del piloto | Resultado | Siguiente requisito |
| --- | --- | --- |
| Identidad y claves de los objetivos | 8 jugadores resueltos, 7 coincidencias únicas | No depende de las seis identidades pendientes de rankings |
| Inicio UTC | Shelton–Alcaraz a precisión de minuto; Tiafoe–Michelsen por un intervalo íntegramente dentro del 08/09 UTC | Cinco objetivos aún sin intervalo cuantitativo UTC certificado |
| Etiquetas y disponibilidad | V3 acepta la cota tardía de observación local del 03/10 en los dos objetivos con inicio UTC | Esa cota no acredita estadísticas correctas ni permite usar resultados durante septiembre |
| Ranking/contexto | No hay versiones acreditadas previas al corte; seis discrepancias de ranking/puntos frente a la copia 31/08 | Resolver procedencia y versión consumida, no elegir una copia por su nombre |
| Estadísticas de objetivos | Siete fallan las protecciones de conteos existentes; columnas rellenas no equivalen a estadísticas válidas | Corregir/verificar extracción antes de una captura futura; no reparar raw sin propuesta específica |
| Historial | 2.918 filas directas sin duplicados/IDs ausentes; 49 con estadísticas faltantes y 59 con valores obligatorios ausentes | Historial UTC/disponibilidad/contexto certificado y frontera inicial declarada |
| Elo y estados | Clausura estructural de 135.200 filas, sin afirmar que sea el mínimo causal; no hay checkpoint V3 auditado | No reiniciar el estado al principio del piloto ni importar Elo heredado |
| Fuentes nuevas/alternativas | Dos consultas concretas a Internet Archive sin snapshots; notas ATP 403; PDF candidato de Indian Wells 404 | No se certifica inexistencia global de archivos; no se justificó cambiar de grupo |

Se documentó además un defecto concreto en ambas funciones de extracción:
`Service Points Won` se asigna por su numerador a `w_svpt/l_svpt`, cuyo contrato
consumido espera el total de puntos al servicio. No se atribuyen a ese único
detalle todas las anomalías sin las respuestas originales. La fase no modifica
scraping, raw ni salidas operativas; incorpora el hallazgo a la decisión pendiente.

La siguiente fase propuesta debe definir la corrección/validación de conteos y la
captura inmutable de ranking, contexto, inicio real e intervalos, resultados y
estadísticas, con observación UTC, versiones y huellas. Capturar desde ahora no
reconstruye automáticamente el historial previo: elegir recuperación de historial/
checkpoint defendible o una metodología prospectiva distinta expresamente definida.
La propuesta está preparada **sin implementación ni programación** en el apartado
[Piloto histórico acotado de V3](../validacion-temporal-estricta.md#piloto-histórico-acotado-3-de-octubre-de-2026).

Auditoría privada: `data/processed/audit-2026-10-03-v3-pilot/final-audit/`, con
entradas, etiquetas y estadísticas separadas, referencias de dependencias y
rechazos individuales. `eligible-inputs.csv` está vacío. Reproducción: 14 archivos
idénticos byte a byte; se conservan la primera pasada y sus resultados. Validación:
21 pruebas enfocadas correctas y 268 huellas protegidas preservadas. No se regeneró
la copia web ni se repitió su QA/build porque no cambia la web. Solo se publica
documentación, dentro de la autorización vigente. Los logs privados de Vercel
siguen como pendiente independiente.
