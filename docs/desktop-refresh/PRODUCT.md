# ATP Insight · Recarga de escritorio

Utilidad personal de Windows para ejecutar el pipeline existente sin manejar una terminal. Su trabajo principal se divide en dos pantallas: elegir una recarga y seguir su progreso.

Inicio presenta Diaria y Mensual, cada una con su botón explícito. Diaria conserva el modelo; Mensual incorpora entrenamiento y evaluación. El historial y la recomendación ayudan a decidir, pero abrir la aplicación nunca inicia trabajo.

Progreso muestra una fase destacada, tiempo transcurrido, etapas numeradas y los cuatro hitos reconocidos más recientes. El usuario puede alternar el resumen y el registro técnico; un fallo abre este último automáticamente. No se inventan porcentajes ni tiempos restantes. Volver al inicio solo está disponible tras terminar.

Puede minimizarse durante el trabajo y la X también minimiza mientras hay ejecución. No añade inicio automático. Conserva el backend del pipeline y el icono de ATP Insight.

La dirección pedida es moderna, profesional e intuitiva: controles redondeados en CustomTkinter, Segoe UI y una extensión clara de la paleta existente. La pantalla de progreso debe tener espacio suficiente y mantener la lectura cómoda al maximizar. No se establece una identidad nueva para la web.

Uso y límites: [guía de la app](../recarga-app-escritorio.md). Diseño vigente: [DESIGN.md](DESIGN.md). Este directorio documenta exclusivamente la superficie de escritorio.
