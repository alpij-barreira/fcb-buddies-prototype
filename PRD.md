# Barça Buddies — Product Requirement Document

**Versión:** 1.1
**Equipo:** Innovation Team — Barça Digital
**Última actualización:** 12 de junio de 2026
**Documento vivo** — se actualiza a medida que construimos y aprendemos.

> **Relación con otros documentos:** este es el PRD global (macro). Convive con la documentación técnica del proyecto (arquitectura de la landing, flujo y sitemap del asistente) y con el mini-documento por historia (micro: la "chuleta" de definición de cada HdU — qué ve / qué puede hacer / qué falla). Las user stories del §4 son el índice; el detalle vive en cada ficha.

> **Decisión de alcance del prototipo (clase 6/6):** nos concentramos **solo en el lado del espectador (usuario fan / asistente)**. El rol host queda conscientemente fuera del prototipo de este módulo — no da tiempo a desarrollar ambos flujos.

---

## 1. Contexto general

### La corporate

FC Barcelona es uno de los clubes de fútbol más grandes del mundo: más de 400 millones de fans en los cinco continentes e ingresos anuales superiores a €900M. Pero solo 85.000 personas caben en el Camp Nou — **el 99% de los fans del Barça nunca lo pisará**.

El club monetiza bien a sus ~150.000 socios locales. Los 400 millones de fans globales, en cambio, solo generan ingresos indirectos (derechos de TV, sponsorships, merchandising genérico). Un fan en Yakarta, Lagos o São Paulo puede comprar una camiseta y ver partidos en TV. Nada más. No hay forma de sentirse parte del club más allá del consumo pasivo.

**El reto que nos plantea la corporate:** ¿qué nuevo producto podría crear el Barça para que los fans internacionales sientan que pertenecen al club — y estén dispuestos a pagar por ello? La tensión: si es demasiado caro, excluye a los mercados emergentes donde está la mayoría de fans; si es demasiado barato, no genera ingresos significativos.

**Restricción de la corporate:** ⚠️ nada de NFTs, tokens ni crypto/blockchain (la experiencia con Socios.com generó mala prensa). Se busca algo tangible y sostenible.

**Nuestro rol:** somos el Innovation Team de Barça Digital. Nuestro mentor actúa como Decider — responsable de las decisiones finales del sprint, representando la visión de la corporate.

### Nuestro producto

**Barça Buddies**: una app móvil para que los culés que viven lejos de su comunidad encuentren a otros aficionados en su ciudad y se organicen para ver los partidos juntos — comunidad desde cero, sin necesidad de conocerse previamente.

```
App de comunidad culé + Activo & Localizado
```

- **Activo:** el producto no es un directorio ni un feed — genera acción. Cualquier usuario crea un evento, se une a uno o se convierte en host.
- **Localizado:** el valor ocurre en persona, en tu zona. No es comunidad digital remota — es gente real reuniéndose físicamente cerca de ti.

El producto tiene dos piezas: la **app** (donde viven los eventos) y la **landing** (punto de entrada vía QR durante la retransmisión de los partidos, con un objetivo único: que el usuario reserve un evento).

### La unidad mínima del producto

**El evento**: un partido del Barça + un lugar físico + un host + asistentes con reserva. Todo lo demás (perfiles, mapa, búsqueda, reseñas) existe para que los eventos ocurran y se repitan. Si no hay eventos, no hay producto. Por eso las historias de descubrir eventos y ver su detalle encabezan el índice: nadie reserva sin ver el evento.

---

## 2. People problem

### El problema real

> **El pain no es ver el partido — es no tener con quién compartirlo físicamente.** (Conclusión validada en entrevistas: verlo en casa no transmite la misma emoción; los usuarios echan de menos el ambiente de comunidad de fans.)

### ¿Quién tiene este problema y cuándo aparece?

Culés que viven lejos de su comunidad culé. El research afina el perfil: el momento crítico es **la llegada a una ciudad nueva** — la mudanza es el trigger del problema.

Evidencia de las entrevistas de validación (4 entrevistados: Jorge de la Mora, Oty, Laura y Luis):

- Un entrevistado ve los partidos *"con su pareja (que no es fan), con su hermano en Monterrey a veces, o con amigos si hay alguno disponible — ninguno es culé a excepción de su hermano."* No ve los partidos solo: los ve **sin nadie que comparta el contexto**.
- Otra entrevistada, *"desde que se mudó a Valencia, lo tiene más complejo porque nadie en su entorno apoya al Barça"* — se resigna a ver el fútbol con aficionados que no son del Barça.
- Otro, *"al mudarse a Dublín, empezó viendo partidos solo en bares o pubs. Luego encontró grupo — lo que confirma que la necesidad social existe especialmente al llegar a una nueva ciudad."*
- *"Ver partidos sola en casa no le resulta emocionante. Echa de menos compartir la experiencia con gente que apoye al mismo equipo."*

*(Pendiente: incorporar citas textuales de las grabaciones de las entrevistas si se recuperan; lo anterior son notas de observación por entrevistado.)*

### ¿Cómo lo resuelven hoy y por qué no es suficiente?

- **Peñas oficiales:** existen, pero con barrera de acceso real. Un entrevistado: *"sabe que existen peñas, pero nunca ha visto un partido con una. El problema de encontrar gente física con quien ver partidos existe."*
- **Soluciones fragmentadas:** *"televisión de pago, cafeterías, webs, apps y diferentes fuentes"* — necesita encontrar espacios y personas culés de forma más fácil. La diferenciación validada de Barça Buddies es justamente la **centralización**.
- **Grupos informales / bar de siempre:** funcionan… para quien ya los tiene. Y eso delimita el problema (ver honestidad más abajo).

### Honestidad del research — a quién NO servimos (hoy)

1. **Quien ya tiene grupo.** *"El usuario ya ha encontrado un grupo social con el que ver los partidos; quizá le podemos ayudar a ampliarlo, pero encontró una alternativa similar."* Para este perfil, las soluciones actuales son suficientes.
2. **Quien no puede ni ver el partido.** Dos entrevistas (perfil en Marruecos) señalan que *"su mayor problema es acceder al contenido en sí, no tanto encontrar aficionados."* Ese pain (acceso a la retransmisión) existe y es real, pero **no es el que resolvemos**.
3. **El fan de cada jornada no existe como norma.** Tres señales convergentes del research: no todos ven TODOS los partidos; no se desplazarían por un partido que no es importante; el interés se concentra en Clásicos, finales, Champions y momentos sin planes. **Barça Buddies es un producto de uso ocasional intenso, no semanal.**

---

## 3. Objetivos de negocio

### Qué cambia para el usuario

Antes: sigue al Barça desde la distancia como consumidor pasivo (TV, contenido, camiseta) y vive los partidos sin comunidad. Después: tiene una forma estructurada y sin fricción de **vivir los partidos importantes acompañado, en persona, en su ciudad** — y de crear esa comunidad él mismo si no existe.

Para la corporate: Barça Buddies convierte la lealtad invisible de los fans internacionales en **pertenencia tangible y medible** (eventos reales, asistencia real), que es la base sobre la que construir monetización — sin crypto y sin traicionar a los fans.

### Cómo sabemos que tiene éxito

**Métrica norte (propuesta, pendiente de validar con el Decider):** reservas completadas que acaban en **asistencia real** al evento. No reservas a secas — gente que de verdad fue. Es la única métrica que demuestra el atributo Localizado y la promesa del brief (pertenencia, no consumo pasivo).

### Señales de dirección (propuestas)

**Embudo de conversión:**
- % de escaneos del QR que llegan a la landing y hacen clic en el CTA — ¿funciona el momento-partido como canal?
- % de visitantes que completan registro + reserva — ¿la fricción del login mata la conversión?
- Apuntados a la lista de espera por ciudad — prueba de demanda donde aún no hay eventos.

**Atributo Activo:**
- Ratio de usuarios que crean eventos vs. solo asisten — si nadie crea, el producto es Fever, no Barça Buddies.
- % de eventos creados que llegan a celebrarse con ≥1 reserva confirmada.

**Señal de negocio:** pendiente — no se puede definir métrica de ingresos sin modelo de ingresos (ver §6, Preguntas abiertas).

### Las condiciones del éxito según el research

La diferenciación (centralizar + entorno específicamente culé) está validada, **pero no es automática**. El cambio desde las soluciones actuales depende de cinco condiciones identificadas en las entrevistas:

1. Que haya gente apuntada
2. Eventos reales
3. Confianza
4. Facilidad de compartir
5. Incentivos para asistir

Las condiciones 1–2 son el riesgo de lanzamiento (huevo y gallina); la 3 motivó la inclusión de reseñas en el scope; la 4 respalda la story de compartir evento; la 5 está abierta (§6).

---

## 4. User stories

El índice de todo lo que hay que construir, agrupado en épicas. Cada historia cubre **una sola acción**. El detalle de cada una (la chuleta: qué ve / qué puede hacer / qué falla) vive en su mini-documento.

> **Perfil único:** todas las historias son del **usuario fan** (registrado / no registrado) — el lado del espectador. El rol host queda fuera del prototipo (decisión de scope, §5).
>
> **Sobre el orden:** las historias están ordenadas siguiendo el flujo del usuario (descubrir → detalle → acceder → reservar → después). La **priorización formal** (estimación en story points + MoSCoW por historia, vía planning poker en equipo) es el paso 4 de los deberes y se hará después de definir — este índice se reordenará entonces por prioridad real.

### Épica 1 — Descubrir eventos

1. **HDU1 · Descubre un grupo de culés cerca.** Como usuario fan, quiero descubrir eventos del Barça cerca de mí para ver un partido. *(Exploración geolocalizada: mapa interactivo, datos clave por evento, alternar vista mapa/lista, estado vacío con ampliar radio o crear evento, exploración sin cuenta.)*
2. **HDU2 · Búsqueda manual sin compartir ubicación.** Como usuario fan, quiero buscar eventos por ciudad o zona para ver un partido. *(Búsqueda sin geolocalización, filtros por tipo de espacio, estado vacío que sugiere ajustar búsqueda o crear evento.)*
3. **HDU3 · Explorar por calendario de partidos.** Como usuario fan, quiero explorar los eventos a través del calendario de partidos del Barça para encontrar eventos del partido que me interesa. *(Vista de calendario por competición; datos clave por partido; seleccionar un partido para ver sus eventos asociados. Es la tercera vista de exploración, complementaria a mapa/lista de HDU1.)*

### Épica 2 — Ver el detalle de un evento

4. **HDU4 · Detalle del evento.** Como usuario fan, quiero ver toda la información de un evento para decidir si reservo. *(Partido retransmitido, local con dirección y mapa, quién es el host, asistentes confirmados y aforo, opción visible de reservar, acceso sin cuenta.)*
5. **HDU5 · Ver reseñas del local y del host.** Como usuario fan, quiero ver las valoraciones de otros asistentes sobre el local y el host para confiar antes de reservar. *(Acción separada de HDU4 — una sola acción por historia. Motivada por research: la confianza es condición para reservar.)*

### Épica 3 — Acceder

6. **HDU6 · Crear cuenta para reservar.** Como usuario fan no registrado, quiero crearme una cuenta para poder reservar el evento al que quiero ir. *(Formulario con obligatorios y opcionales, geolocalización opcional, validación con estados de error, y volver al evento que quería reservar tras registrarse.)*

### Épica 4 — Reservar y gestionar mi asistencia

7. **HDU7 · Reservar plaza.** Como usuario fan registrado, quiero reservar una plaza en un evento para asistir. *(Ajustar nº de asistentes, confirmación, el evento queda en Mis eventos con estado guardado / pendiente / confirmado.)*
8. **HDU8 · Compartir el evento.** Como usuario fan registrado, quiero enviarle a mis amigos los detalles del evento porque he reservado huecos para ir en grupo. *(Compartir desde la reserva confirmada, menú nativo del móvil, mensaje con partido, fecha/hora, local, dirección y enlace.)* — Respaldada por research (condición 4 de la diferenciación).
9. **HDU9 · Guardar en mi calendario.** Como usuario fan registrado, quiero guardar el evento al que voy en mi propio calendario para tenerlo organizado fuera de la aplicación. *(Google Calendar, Apple Calendar, etc.)*
10. **HDU10 · Cancelar mi reserva.** Como usuario fan registrado, quiero cancelar mi reserva para dejarle la plaza a otra persona. *(Confirmación previa anti-error; la plaza vuelve a quedar disponible y el host recibe notificación.)*

### Épica 5 — Después del evento

11. **HDU11 · Evaluar mi experiencia.** Como usuario fan registrado, quiero evaluar mi experiencia en el evento al que he asistido una vez finalizado, porque quiero colaborar en las reseñas y que aparezca en mi perfil. *(Solo tras finalizar y con reserva confirmada; recordatorio; queda en el historial del perfil.)* — Incluida tras las entrevistas: la confianza es condición para reservar.

### ¿Hay perfiles sin representar?

Sí, **conscientemente**: el **host** (usuario individual o bar/local) — crear evento, gestionar reservas, confirmar asistentes, notificaciones. No es un olvido: es la decisión de scope del prototipo (§5). Sus historias se escribirán si el producto avanza más allá de este módulo.

---

## 5. Scope

A alto nivel — no repite las historias. Clasificado con MoSCoW.

### Must have — sin esto el producto no funciona

- **Descubrir eventos cercanos** (geolocalizado, manual y por calendario de partidos) — *Localizado*
- **Detalle del evento** con la información de decisión (partido, local, host, aforo)
- **Reserva de plaza** con registro/login integrado en el flujo y cancelación
- **Mis eventos** con estados (guardado / pendiente / confirmado)
- **Landing con QR** como punto de entrada, objetivo único de reserva y estado vacío como lista de espera por ciudad

### Should have — importante, pero el producto puede existir sin ello de momento

- **Sistema de reseñas de locales y hosts** — *incorporado tras las entrevistas: los usuarios señalaron la confianza ("¿cómo se verifican eventos, lugares y personas?") como condición para reservar*
- **Compartir evento** — respaldado por research (condición de cambio nº 4)

### Could have — deseable si hay tiempo

- **Guardar en calendario del dispositivo** — refuerza *Localizado* (una cita real vive en tu calendario) con coste de construcción bajo
- **Live Now** (indicador de evento activo durante el partido) — pendiente de ubicar en pantalla

### Won't have (esta fase) — descartado conscientemente, no "a la basura"

- **El lado host completo** (crear evento, gestionar y confirmar reservas, notificaciones, caso bar/local) — decisión de la clase: solo el lado del espectador; el prototipo no cubre ambos flujos
- **Chat entre usuarios** — el vínculo empieza en el partido, no antes; añade moderación y complejidad sin reforzar los atributos
- **Integración con el calendario oficial de partidos del FCB** (datos en tiempo real) — en esta fase el calendario se gestiona manualmente
- **Versión web de la app** — el prototipo de app es solo móvil; la landing sí es web
- **Gamificación / incentivos estructurados para asistir** — el research la señala como palanca (condición 5), pero debe definirse junto al modelo de ingresos, no improvisarse
- **Verificación formal de hosts y locales** (badges, validación) — en esta fase la confianza se construye con reseñas e información visible

> **Cambios de scope registrados:** "reseñas" y "calendario del dispositivo" estaban inicialmente fuera de alcance y entraron tras las entrevistas de validación. El "lado host" estaba como pendiente y pasó a Won't have por decisión de alcance de la clase (6/6). Documentado para que las decisiones queden registradas, no coladas.

---

## 6. Preguntas abiertas

Lo que todavía no está resuelto y necesita decisión. Si esta sección estuviera vacía, no estaríamos siendo críticos con nuestro propio producto.

### De negocio

1. **Modelo de ingresos: por definir.** Es la pregunta del brief de la corporate ("¿estarían dispuestos a pagar?") y aún no tiene respuesta. Opciones sobre la mesa sin decidir: comisión por reserva, suscripción, partnership con bares/locales, freemium. Bloquea: la métrica de negocio (§3) y el diseño de incentivos (§5).
2. **¿Oficial, de fans, gratuita o de pago?** Los entrevistados no saben qué relación tiene el producto con el club — y necesitan saberlo para confiar. Tensión con el flag legal (no apropiarse de la marca FCB ni parecer producto oficial sin serlo). Decisión de posicionamiento pendiente con el Decider. Implicación accionable: la landing y el onboarding deben aclarar qué es esto.

### De producto

3. **El problema del switching (hipótesis no validada).** Nuestra solución falla en aportar valor a quien ya tiene bar/grupo y a quien no se desplazaría por un partido no importante. El equipo concluyó que *"resultaría importante contar con elementos adicionales que aporten valor para solventar esas casuísticas"* — ¿cuáles? Sin responder. Relacionado: ¿asumimos como target al culé sin grupo (recién llegado, ciudad sin red) y renunciamos explícitamente al que ya lo tiene?
4. **Huevo y gallina del lanzamiento.** Las condiciones 1–2 del cambio (gente apuntada, eventos reales) no se cumplen el día 1. La lista de espera por ciudad mitiga, pero ¿cuál es la estrategia de densidad inicial (ciudades semilla, partnerships con bares, partidos grandes como momentos de lanzamiento)?
5. **¿Qué incentivos para asistir?** Condición 5 del research. ¿Beneficios del club? ¿Reconocimiento en el perfil? Conecta con monetización — sin definir.
6. **Producto de uso ocasional:** el interés se concentra en partidos importantes. ¿Aceptamos y diseñamos para picos (Clásicos, Champions) o buscamos mecánicas de recurrencia?
7. **Dependencia del host sin host en scope.** El prototipo cubre solo al espectador, pero la unidad mínima (el evento) la crea un host. Para el prototipo: ¿los eventos se simulan con datos de ejemplo? ¿Y qué pasa con las acciones del asistente que notifican al host (cancelación, reserva)? Hay que decidir cómo se representa ese límite en el prototipo.

### De diseño / construcción

8. **¿Dónde va la puerta de login?** El flujo del asistente la coloca antes de "Detalles de la reserva"; el sitemap, después. Hay que unificar. (La HDU6 ya garantiza el retorno al evento en ambos casos.)
9. **Priorización pendiente.** Las historias están definidas pero sin estimar ni priorizar (planning poker + MoSCoW por historia). Es el paso 4 de los deberes — el índice del §4 se reordenará por prioridad real.

### Asunciones no validadas

- Que el QR durante la retransmisión funciona como canal de adquisición (nadie lo ha probado aún — la métrica de embudo lo medirá).
- Que el host individual querrá abrir su casa/espacio a desconocidos (las entrevistas validaron el lado asistente; el lado host no se ha investigado — y ahora además está fuera de scope).
- Que la disposición a pagar existe (el brief la pide; el research no la ha tocado).

---

## Anexo — Estado de validación de hipótesis (Scorecard, junio 2026)

| Hipótesis | Resultado | Conclusión |
|---|---|---|
| Cliente target | ✅ | Perfil acertado: aficionados que viven la experiencia desde la distancia, siguen al club, consumen partidos y contenido y valoran la experiencia social del fútbol. Matiz: no todos ven TODOS los partidos. |
| Problema | ✅ | El pain no es ver el partido sino no tener con quién compartirlo físicamente. Verlo en casa no transmite la misma emoción; echan de menos el ambiente de comunidad de fans. |
| Enfoque | ✅ | Funciona, pero pide más claridad y confianza. "Culés near you" y el flujo se entienden. Dudas: ¿oficial/de fans/gratis/de pago? ¿Cómo se verifican eventos, lugares y personas? |
| Cambio-Switching | ❌ | Falla en aportar valor a quien ya tiene bar/grupo o no se desplazaría por un partido no importante. Hacen falta elementos adicionales de valor. |
| Diferenciación | ✅ | Gana frente a redes, búsquedas sueltas, bares y grupos informales porque centraliza y reúne fans en un entorno específico. Condicional a: gente apuntada, eventos reales, confianza, facilidad de compartir, incentivos. |
| Click | ✅ | La propuesta se entiende y genera interés, sobre todo para partidos importantes (Clásico, finales, Champions) y momentos sin planes. |
