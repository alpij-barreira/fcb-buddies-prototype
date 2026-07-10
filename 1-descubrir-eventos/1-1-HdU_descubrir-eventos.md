## Historia de usuario
Como usuario fan, quiero descubrir eventos del Barça cerca de mí para ver un partido en compañía.

## Qué ve el usuario

### Pantalla principal — Vista mapa
- Mapa interactivo a pantalla completa con eventos como pins (estilo Google Maps), cada pin muestra el nombre del evento.
- En la parte superior: campo de búsqueda por ciudad o zona, siempre visible.
- Debajo de la búsqueda: el partido seleccionado en una tarjeta compacta (escudos, vs, fecha/hora). Si el usuario pulsa sobre ella, navega al calendario de partidos (otra HdU) para cambiar de partido; al volver, el mapa actualiza los eventos para el nuevo partido.
- Slider de radio de búsqueda siempre visible. Por defecto 5 km. Al moverlo, los pins indican la distancia en metros/km.
- Botón visible para alternar entre vista mapa y vista lista.
- Icono/botón de filtros con contador de filtros activos (criterios pendientes de definir).
- Si la geolocalización está activa, el mapa centra en la ubicación del usuario.

### Al pulsar un evento en el mapa
- El mapa se reduce y aparece un panel inferior con los datos clave del evento: nombre, ubicación, distancia (si hay geolocalización) y aforo (reservas actuales / máximo).
- El panel tiene dos acciones: "Más detalles" (abre vista completa del evento) y "Reservar plaza".
- Una X cierra el panel y el mapa vuelve a ocupar toda la pantalla.

### Vista lista
- Tarjetas con: nombre del evento, ubicación, distancia (si hay geolocalización) y relación reservas actuales / aforo máximo.
- Mismos filtros, búsqueda y partido seleccionado que en la vista mapa.

## Qué puede hacer
- Alternar entre vista mapa y vista lista.
- Explorar eventos y abrir el detalle sin necesidad de cuenta (la cuenta se exige solo al reservar).
- Buscar por ciudad o zona en el campo de búsqueda.
- Ajustar el radio de búsqueda con el slider.
- Filtrar eventos por criterios (pendiente de definir); añadir y quitar filtros fácilmente.
- Pulsar un pin para ver el panel de resumen; desde ahí ir a "Más detalles" o "Reservar plaza".
- Cambiar de partido pulsando la tarjeta del partido seleccionado (navega al calendario, otra HdU).

## Qué falla
- **Geolocalización denegada:** no se muestra mapa vacío. Se pide al usuario que introduzca una ciudad o zona manualmente. El mapa nunca puede quedarse sin ciudad seleccionada.
- **Error al obtener ubicación:** mensaje informativo con dos opciones: "Volver a intentarlo" y "Buscar una ubicación".
- **Carga en curso:** se muestra estado de carga (skeleton/spinner), nunca una pantalla vacía.
- **Sin eventos en el radio:** se permite ampliar el radio o buscar en otra zona.
- **Filtros sin resultados:** los filtros aplicados siguen visibles con acción clara para modificarlos o eliminarlos.
- **Ciudad no localizable:** error contextual en el campo de búsqueda sin borrar el texto introducido.
- **Error técnico del mapa:** opción de reintentar y fallback a vista lista si los datos de eventos están disponibles.
- **Crear evento fuera del MVP:** no mostrar botón funcional. Mostrar "Próximamente podrás crear tu propio evento" con acción alternativa como "Explorar otras zonas".
