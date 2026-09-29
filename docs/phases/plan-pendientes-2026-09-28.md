# Plan de acción de ATP Insight

Fecha: 28/09/2026. Revisión: 30/09/2026. Estado: Next.js publicado; contrato temporal V2
implementado y probado en local; revisión de 163 fichas ATP completada y alta de catálogo pendiente de permiso.
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
  Revisar el diff, excluir secretos, datos completos y modelos, y publicar solo
  archivos del bloque comprobado. Respetar las protecciones de la rama.
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

## Seguimiento

| Etapa | Estado | Evidencia de cierre |
| --- | --- | --- |
| Next.js | Completada y publicada | Next.js 16.3.6, React 19.3.0, Node 24; 61 pruebas locales, 30 versionadas, build local y Vercel correctos; PR #1 |
| Identidades | Fichas verificadas; propuesta de catálogo pendiente de permiso | 163 fichas contrastadas; 76 identidades resueltas sin editar raw. Propuesta: 76 altas (214589–214664), nacimiento de ID 213983 y 10 casos no resolubles con certeza. Con la propuesta: 153 resueltos, 10 pendientes y ningún ID duplicado en 2.290 filas del ranking |
| Fechas históricas | Cobertura auditada; cuatro fechas incorporadas a derivados locales | 2.952 filas anuales y 26 archivos sin fecha real; 4 correcciones contrastadas. Regenerados 31 derivados y su copia web, incluidos cuadros, estadísticas y perfiles. La cronología histórica completa sigue sin verificarse |
| Validez temporal del modelo | Código V2 implementado y validado; datos históricos pendientes | Elo previo, disponibilidad individual de resultados nocturnos, metadatos de ranking/contexto, CV/calibración purgadas y prueba final separada; 170 pruebas Python. No se ha entrenado ni activado un modelo estricto |
| Publicación y Vercel | Next y aviso de métricas publicados y verificados | Next: PR #1 y 31 visitas QA. Aviso heredado: commit 0498a20, Vercel success, `/model` y `/feature-importance` revisados en escritorio/móvil y filtro Elo sin errores |
| Recarga mensual | Excluida: ejecutada por el usuario | Estado local success, finalizada el 28/09 a las 20:25; no relanzada por Codex |

Referencias del diagnóstico: `docs/correcciones-auditoria-web.md`,
`docs/recarga-app-escritorio.md`, `docs/limitations.md` y `docs/modeling.md`.

Evidencia del primer bloque: `docs/nextjs-16-migration.md` y
[PR #1](https://github.com/jandrogv/tennis-atp-predictor/pull/1).
Auditoría posterior: `docs/validacion-temporal-estricta.md`. El código Python y sus
pruebas permanecen privados según `.gitignore`; solo se publica su documentación.
Siguiente etapa de datos: aprobar la propuesta concreta del catálogo, investigar
los 10 casos ambiguos y completar fechas y procedencia trazables antes de la
transición manual al contrato estricto. No se da por corregida la cronología
histórica ni se presentan métricas nuevas a partir de pruebas simuladas.

Revisión de cierre del 30/09: 170 pruebas Python, 63 pruebas web, verificador de
datos y compilación correctos; 31 visitas locales con interacciones y móvil.
La caché de snapshots de ranking se actualiza si cambia la fuente, conservando
los archivos realmente inalterados. Modelo y catálogo raw mantienen sus huellas.
Los datasets completos renovados permanecen locales; los commits públicos solo
incluyen el aviso del modelo y documentación. Véase
`docs/auditoria-identidades-atp-2026-09-30.md` para la propuesta de altas pendiente.
