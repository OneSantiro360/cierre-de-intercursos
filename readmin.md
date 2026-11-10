# Guía sencilla de funciones

Este archivo explica, con palabras sencillas, qué hace cada función importante del proyecto y en qué archivo se encuentra.

## JavaScript del navegador

Estos archivos se ejecutan en el navegador de la persona que visita la página.

### `js/login.js`

#### Evento `submit` del formulario `loginForm`

Este código se ejecuta cuando se envía el formulario de inicio de sesión.

Hace lo siguiente:

1. Evita que la página se recargue.
2. Lee el número de identificación y la contraseña.
3. Comprueba que el número solo tenga entre 1 y 20 dígitos.
4. Comprueba que se haya escrito una contraseña.
5. Envía los datos a `/api/login`.
6. Muestra un mensaje de éxito o de error.
7. Si el inicio de sesión funciona, redirige a `index.html`.

El evento no tiene un nombre propio porque está escrito directamente así:

```js
formulario.addEventListener("submit", async (e) => {
    // Código del inicio de sesión
});
```

### `js/register.js`

#### Evento `submit` del formulario `registroForm`

Este código se ejecuta cuando se envía el formulario de registro.

Hace lo siguiente:

1. Lee el nombre, el número de identificación y las contraseñas.
2. Comprueba que el número solo tenga dígitos.
3. Comprueba que las dos contraseñas coincidan.
4. Comprueba que exista la contraseña de autorización.
5. Envía los datos a `/api/register`.
6. Muestra un mensaje de éxito o de error.
7. Si el registro funciona, redirige a `login.html`.

### `js/main.js`

#### `crearIconoSesion()`

Crea el ícono que se muestra cuando una persona inició sesión.

Actualmente utiliza el ícono de Font Awesome:

```text
fa-solid fa-circle-user
```

Devuelve un elemento HTML `<i>` listo para mostrar en la página.

#### `cerrarSesion(boton)`

Cierra la sesión de la persona.

Hace lo siguiente:

1. Desactiva temporalmente el botón.
2. Envía una solicitud `POST` a `/api/logout`.
3. El servidor elimina la cookie de sesión.
4. Redirige a `index.html`.

Si ocurre un error, vuelve a activar el botón y muestra el error en la consola.

#### `crearMenuSesion(usuario, enlace)`

Crea el menú que aparece al hacer clic en el ícono del usuario.

El menú contiene:

- El nombre de la persona que inició sesión.
- El botón `Cerrar sesión`.

También se encarga de abrir y cerrar el menú cuando se hace clic en el ícono o fuera del menú.

#### `actualizarMenuSesion(usuario)`

Actualiza la navegación cuando existe una sesión iniciada.

Hace dos cambios:

1. Reemplaza el ícono de login por el ícono de usuario.
2. Agrega el nombre de la persona dentro del menú hamburguesa.

Utiliza los elementos que tienen estas clases:

```text
.nav-left
.user-menu-name
```

#### `cargarSesion()`

Consulta al servidor para saber si existe una sesión iniciada.

Envía una solicitud `GET` a `/api/me`.

Si el servidor confirma que existe una sesión, llama a:

```js
actualizarMenuSesion(resultado.user);
```

Esta función se ejecuta al final de `main.js`:

```js
cargarSesion();
```

### `js/responsive.js`

#### Evento `click` de `.menu-btn`

Cuando se hace clic en el botón de tres líneas:

- Agrega o quita la clase `show` de `.nav-left`.
- Agrega o quita la clase `show` de `.menu-1`.

La clase `show` permite mostrar el menú y girar el ícono de hamburguesa.

### `js/nada.js`

Este archivo está vacío actualmente y no contiene funciones.

## Funciones de las APIs

Los archivos dentro de `api/` se ejecutan en el servidor. El código de estos archivos no se ejecuta directamente en el navegador.

En cada archivo se utiliza esta estructura:

```js
module.exports = async (req, res) => {
    // Código de la API
};
```

La función recibe:

- `req`: información de la solicitud recibida.
- `res`: herramienta para enviar una respuesta.

### `api/login.js`

#### Función principal `module.exports`

Controla el inicio de sesión.

Hace lo siguiente:

1. Comprueba que la solicitud sea `POST`.
2. Lee el número de identificación y la contraseña.
3. Valida los datos recibidos.
4. Busca el usuario en la base de datos.
5. Compara la contraseña usando `bcrypt`.
6. Crea un token usando `jsonwebtoken`.
7. Guarda el token en una cookie llamada `session`.
8. Devuelve los datos básicos del usuario.

### `api/register.js`

#### Función principal `module.exports`

Controla el registro de nuevos usuarios.

Hace lo siguiente:

1. Comprueba que la solicitud sea `POST`.
2. Lee todos los campos enviados.
3. Valida el nombre, el número y las contraseñas.
4. Busca un administrador autorizado.
5. Comprueba la contraseña de autorización.
6. Comprueba que el número no esté registrado.
7. Cifra la contraseña del nuevo usuario.
8. Guarda el usuario con el rol `user`.

El registro público nunca puede elegir su propio rol de administrador.

### `api/me.js`

#### Función principal `module.exports`

Comprueba si existe una sesión activa.

Hace lo siguiente:

1. Busca la cookie `session`.
2. Comprueba el token usando `JWT_SECRET`.
3. Si el token es válido, devuelve los datos del usuario.
4. Si no existe o está vencido, devuelve `authenticated: false`.

Esta API es utilizada por `cargarSesion()`.

### `api/logout.js`

#### Función principal `module.exports`

Cierra la sesión.

Lo hace colocando la cookie `session` con una duración de cero segundos. De esta forma, el navegador elimina la cookie.

Esta API es utilizada por `cerrarSesion(boton)`.

### `api/test-db.js`

#### Función principal `module.exports`

Comprueba si el servidor puede conectarse a MySQL.

Ejecuta una consulta sencilla y devuelve un mensaje indicando si la conexión funciona.

## Flujo de inicio de sesión

El proceso completo funciona así:

```text
login.html
    ↓
js/login.js
    ↓
POST /api/login
    ↓
api/login.js
    ↓
Cookie session
    ↓
js/main.js
    ↓
GET /api/me
    ↓
Se muestra el usuario en el menú
```

## Flujo de cierre de sesión

```text
Ícono de usuario
    ↓
cerrarSesion(boton)
    ↓
POST /api/logout
    ↓
Se elimina la cookie session
    ↓
Regreso a index.html
```

## Archivos principales

| Archivo | Función principal |
|---|---|
| `login.html` | Página de inicio de sesión |
| `register.html` | Página de registro |
| `js/login.js` | Lógica del formulario de login |
| `js/register.js` | Lógica del formulario de registro |
| `js/main.js` | Sesión, usuario y cierre de sesión |
| `js/responsive.js` | Menú hamburguesa |
| `api/login.js` | Autenticación en el servidor |
| `api/register.js` | Registro en el servidor |
| `api/me.js` | Consulta de sesión |
| `api/logout.js` | Cierre de sesión |
| `api/test-db.js` | Prueba de conexión con la base de datos |
