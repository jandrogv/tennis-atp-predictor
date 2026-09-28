# Migración a Next.js 16

## Alcance

La web pasa de Next.js 14.2.35 / React 18 a Next.js 16.3.6 / React 19.3.0,
versiones estables consultadas el 28/09/2026. Usa Node 24.x y Turbopack en
desarrollo y producción. No modifica el pipeline Python, los modelos ni la app
de escritorio y no ejecuta la recarga mensual.

Se adaptan los parámetros asíncronos y los metadatos de las rutas de jugadores,
predicciones, torneos y estadísticas de partidos. Se actualizan tipos de React,
lockfile, JSX automático y referencias de tipos generadas por Next.js.
El manifiesto de imágenes se guarda sin BOM, que Turbopack rechazaba como JSON.
Se actualizan dependencias transitivas compatibles para resolver los avisos de
Browserslist y baseline-browser-mapping detectados al instalar.

La entrega incorpora también correcciones de interfaz ya verificadas localmente:
cuadro ampliado mediante diálogo modal, resultados por fase cuando no existe un
cuadro individual, claves únicas en rankings, tabla móvil de perfiles y dirección
correcta de la ventaja de ranking ATP. No cambia el diseño visual de la web.

Solo se actualiza un estado temporal en el índice público de torneos (Laver Cup:
active → grace_period). No se incorporan datasets completos, modelos ni cambios
manuales de data/raw. Las tablas de datos locales más recientes se mantienen
separadas de esta migración de código.

## Validación local

- Compilación de producción correcta con Next.js 16.3.6 y Turbopack.
- 61 pruebas web: 43 de scripts locales y 18 de bibliotecas TypeScript.
  El repositorio público excluye algunas herramientas de preparación/validación;
  las 30 pruebas incluidas en Git también se ejecutaron por separado y pasan.
- `npm audit`: cero vulnerabilidades en el árbol instalado al revisar.
- Verificador de datos: cero errores críticos; nueve avisos preexistentes sobre
  identidades duplicadas, predicciones auxiliares antiguas, nombres de rondas y
  ganador vacío en torneos por equipos. Los datos locales de la recarga reciente
  también pasan y reducen esos avisos a cinco.
- Chrome oculto con Playwright, producción en localhost:3001: todas las familias
  de rutas de la app, metadatos, cuatro rutas dinámicas con datos reales,
  robots/sitemap y las dos imágenes sociales. Sin errores ni avisos de consola.
- Interacciones: búsqueda y cambio de fecha de rankings, selección de dos
  jugadores en el comparador, enlace a estadísticas, ampliación modal del cuadro
  y cierre con Escape. Perfiles, rankings y cuadro comprobados a 390×844, sin
  desbordamiento horizontal de la página; escritorio a 1440×1000.
- Las rutas inexistentes presentan la pantalla de no encontrado y noindex. Next
  puede devolver HTTP 200 cuando ya comenzó el streaming; se comprobó el contenido
  y la directiva, no solo el código HTTP.

El navegador integrado falló al iniciar por un error ACL del entorno. Se usó
Playwright con un perfil efímero de Chrome en modo headless. Las capturas y el
registro de QA permanecen fuera del repositorio.

## Publicación y reversión

Publicada el 28/09/2026 mediante la [PR #1](https://github.com/jandrogv/tennis-atp-predictor/pull/1).
Commit de integración: `0082572eba6f46e86221e02c42deb9d85394af88`.
Vercel confirma éxito para ese commit en el
[despliegue de producción](https://vercel.com/jandrogvs-projects/atpinsight/57F2B5xaHmxpAQaGcnmyre8VPhsR).

La [web pública](https://atpinsight-two.vercel.app) supera las mismas comprobaciones
de rutas e interacciones anteriores: 31 visitas, sin errores ni avisos de consola,
cuadro modal por encima del pie y vistas móviles sin desbordamiento horizontal.
La vista previa exigía iniciar sesión en Vercel; no se considera una prueba visual
superada. La comprobación visual se realizó después sobre producción.

La carpeta principal también se integra y compila con Next.js 16.3.6 mediante
`npm ci` y `npm run build`. Se conservan los datos locales recientes; no se ejecuta
ninguna recarga. El actualizador usa el mismo comando de compilación actualizado.

Si aparece una regresión, restaurar el despliegue anterior o revertir los commits
de esta entrega, ejecutar `npm ci` desde web y volver a compilar. No restaurar
datos ni modelos para revertir una migración de frontend. No cambiar dependencias
del entorno principal mientras esté ejecutando una recarga.

Referencias: [migración oficial a Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16),
[cambios de Next.js 15](https://nextjs.org/docs/app/guides/upgrading/version-15),
[respuestas not-found con streaming](https://nextjs.org/docs/app/api-reference/file-conventions/not-found).
