## Historia de usuario
Como usuario fan no registrado, quiero crearme una cuenta para poder reservar el evento al que quiero ir.

## Punto de entrada
- El usuario está en la pantalla del mapa, pulsa un evento y se abre el panel inferior con el resumen.
- Desde ese panel, pulsa "Reservar plaza".
- Si no ha iniciado sesión, aparece un modal de acceso explicando que necesita una cuenta para completar la reserva.
- El sistema conserva el evento de origen y la intención de reserva durante todo el proceso.

## Qué ve el usuario

### Modal de acceso (primera pantalla)
- Título claro: "Crea tu cuenta para reservar".
- Mensaje contextual indicando que tras completar el registro volverá al evento.
- Opciones de registro:
  - Continuar con Google (no funcional en la demo).
  - Continuar con Apple (no funcional en la demo).
  - Continuar con correo electrónico.
- Acceso secundario: "Ya tengo una cuenta" (lleva a iniciar sesión).
- Opción para cerrar el modal y volver al detalle del evento sin registrarse.

### Formulario de registro por correo electrónico
- Campos obligatorios: nombre, apellidos, correo electrónico, contraseña.
- Campos opcionales: ciudad, localidad o zona.
- Indicación visible de qué campos son obligatorios y cuáles opcionales.
- Opción para mostrar/ocultar contraseña.
- Checkbox para aceptar términos de uso y política de privacidad.
- Botón principal: "Crear cuenta y continuar".

## Qué puede hacer
- Elegir método de registro (solo correo electrónico funcional en la demo).
- Introducir y revisar sus datos antes de enviar.
- Mostrar u ocultar la contraseña.
- Consultar términos de uso y política de privacidad.
- Cambiar a "Iniciar sesión" si ya tiene cuenta.
- Cerrar el modal y volver al evento sin registrarse.
- Completar el registro y volver automáticamente al evento con la intención de reserva conservada.

## Qué falla
- **Campo obligatorio vacío o inválido:** señalar el campo concreto junto al error y explicar cómo corregirlo, no un mensaje genérico.
- **Correo ya existente:** informar al usuario y ofrecer iniciar sesión.
- **Error técnico durante el registro:** conservar los datos introducidos y permitir reintentar.
- **Envío duplicado:** evitar crear cuentas duplicadas.
- **Evento sin plazas al volver:** mostrar "Evento completo" y no permitir continuar con la reserva.

## Resultado
- La cuenta queda creada y el usuario autenticado automáticamente.
- Confirmación visual: "Tu cuenta se ha creado correctamente".
- El usuario vuelve automáticamente al evento desde el que inició el registro.
- El registro no crea la reserva; el usuario debe revisar y confirmar la reserva en el siguiente paso.
