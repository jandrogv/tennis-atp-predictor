# App de recarga de ATP Insight

Abre **Actualizar ATP Insight** desde el escritorio. La primera pantalla muestra
los dos modos; pulsa **Iniciar recarga diaria** o **Iniciar recarga mensual**.
Ese botón inicia el proceso y abre una segunda pantalla dedicada al progreso.
Abrir la app no inicia ninguna descarga.

- **Diaria:** descarga los datos pendientes y genera predicciones con el modelo actual.
- **Mensual:** incluye la diaria y añade entrenamiento y evaluación de los modelos
  configurados. Conserva `notebook_legacy`, perfil `standard` y CPU; la interfaz
  no cambia la metodología ni los años de entrenamiento.

El inicio muestra la última recarga correcta, la fecha del modelo y una recomendación.
Si ha pasado un mes natural, falta el modelo o quedó una mensual pendiente,
recomienda mensual. Los dos botones siguen disponibles: el usuario decide.

## Pantalla de progreso

La fase actual ocupa el área principal, junto al tiempo transcurrido. Una lista
muestra las etapas pendientes, en curso y completadas. La diaria tiene cuatro
etapas; la mensual añade entrenamiento y evaluación. Los hitos proceden de
mensajes reales del pipeline. La animación indica actividad; no es un porcentaje
ni una estimación del tiempo restante. Una etapa se marca completada cuando
comienza la siguiente; todas se completan solo tras terminar correctamente.

**Actividad** resume los cuatro últimos hitos reconocidos: fases, torneos y
partidos pendientes o guardados. **Ver registro técnico** cambia esa zona por
la salida del proceso, seleccionable y con seguimiento opcional. **Ver resumen**
vuelve a la vista sencilla. Ante un fallo se muestra el registro automáticamente.
El resumen no interpreta ni oculta los mensajes en el registro completo.

La vista técnica conserva las últimas 3000 líneas; las muy largas se abrevian solo
en pantalla. **Abrir registros** muestra `data/processed/refresh/logs/`, con los
registros completos del pipeline. El historial sigue en
`data/processed/refresh/state.json`.

**Volver al inicio** se habilita al terminar, para elegir otra recarga o reintentar.
Durante la ejecución, **Minimizar** o la X minimizan la ventana sin interrumpir
el torneo. Puedes recuperarla desde la barra de tareas. Mantén el ordenador
encendido y sin suspensión. La app diferencia éxito, fallo y otra recarga activa;
el bloqueo compartido impide dos cargas del actualizador a la vez.

Desde el 05/10/2026 también diferencia **Datos actualizados · predicciones
pendientes**: resultados, rankings y web se han actualizado, pero las nuevas
estadísticas ATP requieren un modelo compatible. Preparación, entrenamiento y
predicciones aparecen omitidos o bloqueados por compatibilidad; la app no los
marca como completados. El aviso también aparece al volver al inicio. El modelo
y las predicciones guardadas se conservan, y otra mensual no elimina este bloqueo.
Consulta [el comportamiento del contrato estadístico](recarga-automatica.md#estadísticas-corregidas-y-modelo-anterior-05102026).

## Diseño e implementación

La app usa CustomTkinter 5.2.2 sobre Tkinter: superficies redondeadas, tipografía
Segoe UI, colores de ATP Insight y dos pantallas independientes. El ancho de
contenido se limita a 1120 unidades lógicas para mantener proporciones al
maximizar. El tamaño inicial es 1040×800 y el mínimo 900×720; Windows puede
aplicar escalado. El icono y el acceso de escritorio se conservan.

- `src/tennis_pipeline/refresh_app.py`: pantallas, hitos y registro mediante hilo/cola.
- `src/tennis_pipeline/auto_refresh.py`: pipeline existente y selección explícita
  `--mode auto|daily|monthly`; no cambia durante este rediseño.
- `scripts/launch_refresh_app.pyw`: arranque con `pythonw.exe`, sin terminal.
- `scripts/install_refresh.ps1`: acceso exclusivamente manual y mismo icono.
- `requirements.txt`: incluye la dependencia visual fijada a la versión probada.
- `tests/test_refresh_app.py`: botones, navegación, etapas y resultados del proceso.
- `docs/desktop-refresh/`: contexto y sistema visual de esta utilidad.

La ventana ya abierta conserva su versión hasta cerrarla. Los cambios aparecen
al abrir de nuevo el mismo acceso. No hay inicio automático ni reconexión desde
una nueva ventana al proceso de otra ventana; si hay una carga activa, déjala
terminar antes de cambiar a la nueva interfaz.

## Verificación

Se han comprobado las dos pantallas en tamaño mínimo y ampliado, el registro
opcional, los estados de éxito y fallo, el doble inicio, la minimización y la
selección explícita diaria/mensual. `python -m pytest tests -q` pasó las 147
pruebas; las pruebas de interfaz usan subprocesos simulados, sin descarga ni
entrenamiento. Las capturas se obtienen solo de la ventana de prueba y etiquetan
las simulaciones. No se ha detenido la carga existente ni modificado `data/raw/`.

Referencia de la biblioteca: [documentación oficial de CustomTkinter](https://customtkinter.tomschimansky.com/documentation/widgets/).
