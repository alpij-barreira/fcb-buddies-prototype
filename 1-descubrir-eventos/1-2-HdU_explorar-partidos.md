## Historia de usuario
Como usuario fan, quiero explorar los partidos del Barça a través de un calendario para encontrar eventos del partido que me interesa.

## Punto de entrada
- Desde la navegación principal (tab de calendario).
- Desde la pantalla de exploración (mapa/lista), pulsando la tarjeta del partido seleccionado.

## Qué ve el usuario

### Navegación por tres tabs
La pantalla tiene tres modos de exploración en la parte superior:

- **Próximos partidos:** lista vertical con scroll infinito, ordenada por fecha. Cada cambio de fecha se marca visualmente como separador.
- **Competición:** el usuario selecciona una competición (Champions League, LaLiga, Copa del Rey, otras) y ve los partidos de esa competición.
- **Calendario:** vista de calendario mensual. Los días con partido tienen un indicador visual. Al pulsar un día, se muestran los partidos de ese día debajo del calendario.

### Cada tarjeta de partido muestra
- Escudos de los dos equipos.
- Nombres de los equipos.
- Competición.
- Fecha y hora.
- Jornada, fase o ronda.
- Indicador de si tiene eventos asociados disponibles.

### Filtros
- Filtro por competición.
- Filtro por equipo masculino / femenino (si entra en el MVP).

## Qué puede hacer
- Navegar entre los tres tabs (próximos, competición, calendario).
- Filtrar por competición y por equipo masculino/femenino.
- Pulsar un partido para desplegar un modal con los detalles ampliados del partido.
- Desde el modal: pulsar "Buscar eventos con este partido" (vuelve al mapa/home filtrado por ese partido) o cerrar el modal para seguir explorando.
- Todo sin necesidad de cuenta.

## Qué falla
- **Partido sin eventos:** indicarlo claramente en el modal y ofrecer alternativas (explorar otros partidos, buscar eventos cercanos).
- **Competición sin partidos:** estado vacío con acción para cambiar o eliminar el filtro.
- **Fecha/hora no confirmada:** mostrar "Por confirmar" en la tarjeta.
- **Partido aplazado o cancelado:** estado visible en la tarjeta; no permitir acceder a reservas.
- **Crear evento fuera del MVP:** no mostrar botones funcionales de creación ni de avisos.
- **Error al cargar el calendario:** mensaje de error con opción de reintentar.
- **Error al cargar eventos asociados:** mantener visible la info del partido y permitir reintentar la carga de eventos.

## Resultado
- El usuario encuentra un partido concreto del Barça.
- El usuario sabe si ese partido tiene eventos disponibles.
- Al pulsar "Buscar eventos", vuelve al mapa/home filtrado por ese partido.
- No se crea ninguna reserva desde esta historia.
