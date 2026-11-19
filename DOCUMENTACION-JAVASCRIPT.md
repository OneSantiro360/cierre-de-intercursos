# Documentacion de archivos JavaScript

Este documento describe la responsabilidad de cada archivo JavaScript del
proyecto y la forma en que se conectan entre si.

## 1. Resumen de la arquitectura

El proyecto tiene tres grupos principales de archivos:

- **Scripts del navegador (`js/`)**: responden a eventos de la interfaz,
  validan formularios y realizan solicitudes `fetch` a la API.
- **Funciones de servidor (`api/`)**: reciben las solicitudes del navegador,
  consultan la base de datos y gestionan la autenticacion.
- **Modulo de base de datos (`lib/db.js`)**: crea y exporta el pool de
  conexiones MySQL utilizado por los endpoints.

Flujo general:

```text
Pagina HTML
    |
    +--> js/login.js ------> api/login.js ------> lib/db.js ------> MySQL
    |
    +--> js/register.js ---> api/register.js ---> lib/db.js ------> MySQL
    |
    +--> js/main.js -------> api/me.js ---------> JWT de la cookie
    |                   \
    |                    ---> api/logout.js ---> elimina la cookie
    |
    +--> js/responsive.js -> menu movil del navegador
```

`consolanav.js` es un script auxiliar de pruebas que intercepta algunas
solicitudes de la API. `js/nada.js` actualmente esta vacio.

## 2. Archivos del navegador

### 2.1 `js/login.js`

Controla el formulario de inicio de sesion de `html/login.html`.

Funciones principales:

1. En las lineas 1-3 obtiene el formulario, el mensaje de estado y el boton de
   inicio de sesion.
2. En la linea 5 registra el evento `submit`; la linea 7 evita que el navegador
   recargue la pagina.
3. En las lineas 9-10 lee el identificador (`userid`) y la contraseña.
4. En las lineas 16-24 valida el identificador y comprueba que exista una
   contraseña. Estos `if` muestran errores al usuario mediante `mensaje`.
5. En las lineas 26-28 desactiva el boton y muestra el texto
   `Verificando...`.
6. En las lineas 31-43 envia los datos mediante `POST` a `/api/login`. Esta es
   la conexion entre el formulario y [`api/login.js`](api/login.js).
7. En las lineas 48-52 interpreta los errores devueltos por la API; las lineas
   64-67 los muestran al usuario.
8. En las lineas 55-62 muestra el exito, limpia el formulario y redirige a
   `/`.
9. En las lineas 69-73 reactiva el boton, tanto si la solicitud tuvo exito como
   si fallo.

Conexion:

```text
html/login.html
    -> js/login.js
    -> POST /api/login
    -> api/login.js
```

### 2.2 `js/register.js`

Controla el formulario de registro de `html/register.html`.

Funciones principales:

1. En las lineas 1-3 obtiene el formulario, el mensaje y el boton de registro.
2. En las lineas 5-14 lee todos los datos que seran enviados al servidor.
3. En las lineas 18-31 estan las validaciones del navegador: identificador
   numerico, confirmacion de contraseña y contraseña de autorizacion. Estos
   `if` muestran errores al usuario antes de contactar la API.
4. En las lineas 33-35 desactiva el boton y muestra `Registrando...`.
5. En las lineas 38-50 envia `username`, `userid`, `password` y
   `adminPassword` mediante `POST` a `/api/register`. Esta es la conexion entre
   el formulario y [`api/register.js`](api/register.js).
6. En las lineas 55-59 interpreta los errores devueltos por la API y las lineas
   64-67 los muestran al usuario.
7. En las lineas 61-71 muestra el exito, limpia el formulario y redirige a
   `/login`.
8. En las lineas 73-77 reactiva el boton al terminar la solicitud.

Conexion:

```text
html/register.html
    -> js/register.js
    -> POST /api/register
    -> api/register.js
```

La validacion del navegador mejora la experiencia del usuario, pero la
validacion importante tambien se repite en `api/register.js`, porque los
datos enviados al servidor no deben considerarse confiables.

### 2.3 `js/main.js`

Gestiona la sesion visible en las paginas generales del sitio.

Funciones:

- `crearIconoSesion()` (lineas 4-10): crea el icono visual del usuario.
- `cerrarSesion(boton)` (lineas 13-31): envia `POST /api/logout`, desactiva
  temporalmente el boton y redirige a `/`. La solicitud se realiza en
  las lineas 18-21, conectando este archivo con
  [`api/logout.js`](api/logout.js).
- `crearMenuSesion(usuario, enlace)` (lineas 35-75): reemplaza el enlace de
  login por un menu que muestra el nombre del usuario y la opcion de cerrar
  sesion. El evento para abrir y cerrar el menu esta en las lineas 60-65.
- `actualizarMenuSesion(usuario)` (lineas 78-96): actualiza los enlaces de
  sesion y el menu movil con el nombre del usuario.
- `cargarSesion()` (lineas 99-117): consulta `GET /api/me` en las lineas
  101-103 y, si existe una sesion valida, actualiza la interfaz en las lineas
  111-113. Esta es la conexion con [`api/me.js`](api/me.js).
- La linea 119 inicia automaticamente la comprobacion al cargar la pagina.

Este archivo se carga en las paginas principales, como `html/index.html`,
`html/equipos.html`, `html/reglamento.html`, `html/search.html` y `html/tabla-de-juego.html`.

Conexiones:

```text
Pagina general
    -> js/main.js
        -> GET /api/me
        -> api/me.js

js/main.js
    -> POST /api/logout
    -> api/logout.js
```

El archivo llama a `cargarSesion()` al final, por lo que la comprobacion de
sesion se ejecuta automaticamente al cargar la pagina.

### 2.4 `js/responsive.js`

Controla la apertura y el cierre de los menus de navegacion en dispositivos
moviles.

En las lineas 1-3, al hacer clic en `.menu-btn`, alterna la clase `show` en:

- `.nav-left`
- `.menu-1`

No realiza solicitudes al servidor ni utiliza la base de datos. Solo depende
de que esos elementos existan en el HTML donde se cargue.

### 2.5 `js/nada.js`

Actualmente no contiene codigo. No tiene funciones, dependencias ni
conexiones con otros archivos.

### 2.6 `consolanav.js`

Es un auxiliar de pruebas o simulacion local.

Funciones:

1. En la linea 1 guarda la implementacion original de `window.fetch`.
2. En la linea 3 reemplaza temporalmente `window.fetch`.
3. En las lineas 4-21, cuando la aplicacion solicita `/api/me`, devuelve una
   respuesta simulada con un usuario de prueba.
4. En las lineas 23-34, cuando solicita `/api/logout`, devuelve una respuesta
   simulada de cierre de sesion.
5. En la linea 35, para cualquier otra URL, utiliza el `fetch` original.
6. En la linea 37 llama a `cargarSesion()`.

Este archivo no debe confundirse con `js/main.js`. Si se carga junto con la
aplicacion, puede ocultar el comportamiento real de `/api/me` y `/api/logout`,
porque intercepta esas solicitudes antes de que lleguen al servidor.

## 3. Archivos de la API

Las funciones ubicadas en `api/` siguen el formato de funciones serverless.
Cada archivo exporta una funcion asincrona que recibe `req` y `res`.

### 3.1 `api/login.js`

Implementa el inicio de sesion.

Flujo por lineas:

1. En las lineas 1-4 importa [`lib/db.js`](lib/db.js), `bcryptjs` y
   `jsonwebtoken`.
2. En las lineas 6-13 solo acepta solicitudes `POST`.
3. En las lineas 15-26 lee `userid` y `password` y valida su formato. Los
   `if` de las lineas 16-23 devuelven errores de entrada al cliente.
4. En las lineas 29-32 consulta la tabla `usuarios` mediante
   [`lib/db.js`](lib/db.js).
5. En las lineas 34-40 informa si el usuario no existe.
6. En las lineas 43-51 compara la contraseña recibida con el hash almacenado
   usando `bcryptjs`.
7. En las lineas 54-56 comprueba que exista `JWT_SECRET`.
8. En las lineas 59-71 genera un token JWT firmado con algoritmo `HS256` y
   vigencia de 7 dias.
9. En las lineas 74-76 guarda el token en una cookie `session` con las opciones
   `HttpOnly`,
   `Secure`, `SameSite=Lax` y `Path=/`.
10. En las lineas 78-88 devuelve los datos basicos del usuario sin enviar la
    contraseña; las lineas 89-92 gestionan errores internos.

Dependencias:

```text
js/login.js
    -> POST /api/login
    -> api/login.js
        -> lib/db.js
        -> mysql2/promise
        -> bcryptjs
        -> jsonwebtoken
```

### 3.2 `api/register.js`

Implementa el registro de nuevos usuarios.

Flujo por lineas:

1. En las lineas 1-3 importa [`lib/db.js`](lib/db.js) y `bcryptjs`.
2. En las lineas 5-12 solo acepta solicitudes `POST`.
3. En las lineas 14-18 lee `username`, `userid`, `password` y
   `adminPassword`.
4. En las lineas 20-31 valida que todos los datos sean textos. Los `if` de
   las lineas 21-27 devuelven errores de entrada al usuario.
5. En las lineas 33-44 limpia y valida el nombre.
6. En las lineas 46-51 valida el identificador numerico.
7. En las lineas 53-71 valida las contraseñas y sus limites.
8. En las lineas 73-76 consulta los hashes de los administradores en MySQL
   mediante [`lib/db.js`](lib/db.js).
9. En las lineas 78-85 informa si no existe un administrador autorizado.
10. En las lineas 88-96 compara la contraseña de autorizacion con `bcryptjs`;
    las lineas 99-103 rechazan el registro si no coincide.
11. En las lineas 106-109 comprueba en MySQL si el identificador ya existe.
    Las lineas 111-115 devuelven el error correspondiente.
12. En la linea 118 genera el hash de la contraseña nueva.
13. En las lineas 122-132 inserta el usuario en la tabla `usuarios` con rol
    fijo `user`.
14. En las lineas 134-145 devuelve la respuesta de registro exitoso. Las
    lineas 149-159 manejan identificadores duplicados y otros errores.

Dependencias:

```text
js/register.js
    -> POST /api/register
    -> api/register.js
        -> lib/db.js
        -> mysql2/promise
        -> bcryptjs
```

El rol no se recibe como dato confiable del cliente; el endpoint siempre
registra al nuevo usuario con rol `user`.

### 3.3 `api/me.js`

Comprueba si existe una sesion valida.

Flujo por lineas:

1. En la linea 2 importa `jsonwebtoken`.
2. En las lineas 4-10 solo acepta solicitudes `GET`.
3. En las lineas 12-17 lee la cookie `session` y extrae el token.
4. En las lineas 19-23 responde que no hay sesion si falta la cookie.
5. En las lineas 27-31 verifica el token con `JWT_SECRET` y permite
   unicamente `HS256`.
6. En las lineas 33-42, si es valido, devuelve `authenticated: true` y los
   datos del usuario.
7. En las lineas 44-47, si el token es invalido o expiro, devuelve
   `authenticated: false`.

Este archivo no consulta MySQL. Confia en la informacion contenida en el JWT
firmado por `api/login.js`.

Conexion:

```text
js/main.js
    -> GET /api/me
    -> api/me.js
    -> valida cookie JWT
```

### 3.4 `api/logout.js`

Implementa el cierre de sesion.

Flujo por lineas:

1. En las lineas 2-8 solo acepta solicitudes `POST`.
2. En las lineas 9-11 devuelve la cookie `session` con `Max-Age=0`.
3. El navegador elimina la cookie.
4. En las lineas 13-15 devuelve un mensaje de confirmacion.

No consulta la base de datos ni necesita `jsonwebtoken`, porque el cierre se
realiza invalidando la cookie del navegador.

Conexion:

```text
js/main.js
    -> POST /api/logout
    -> api/logout.js
    -> elimina la cookie session
```

### 3.5 `api/test-db.js`

Es un endpoint de comprobacion de conectividad con MySQL. En las lineas 1-2
importa el modulo de base de datos.

En la linea 6 ejecuta la consulta:

```sql
SELECT 1 AS conexion
```

Si la consulta funciona, las lineas 8-14 devuelven un estado exitoso. Si falla,
las lineas 16-19 registran el error y devuelven un estado HTTP 500.

Conexion:

```text
GET o POST /api/test-db
    -> api/test-db.js
    -> lib/db.js
    -> MySQL
```

Este endpoint es util para diagnostico, pero no participa directamente en el
login, el registro ni la comprobacion normal de sesion.

## 4. `lib/db.js`: conexion con MySQL

En las lineas 30-39, este modulo importa `mysql2/promise` y crea un pool de conexiones con las
variables de entorno:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Tambien establece:

- `waitForConnections: true`
- `connectionLimit: 5`
- `queueLimit: 0`

En la linea 41 exporta el pool para que otros archivos ejecuten consultas con
`db.execute()` o `db.query()`.

Los endpoints que dependen de este modulo son:

```text
api/login.js
api/register.js
api/test-db.js
        |
        v
    lib/db.js
        |
        v
    MySQL
```

## 5. Variables y dependencias externas

### Variables de entorno

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`: datos de
  conexion con MySQL.
- `JWT_SECRET`: clave utilizada para firmar y validar las sesiones.

### Paquetes de Node.js

- `mysql2`: conexion con MySQL.
- `bcryptjs`: hash y comparacion de contraseñas.
- `jsonwebtoken`: creacion y validacion de tokens JWT.

## 6. Flujo completo de autenticacion

### Inicio de sesion

```text
html/login.html
 -> js/login.js
 -> POST /api/login
 -> api/login.js
 -> lib/db.js
 -> MySQL: busca el usuario
 -> bcryptjs: compara la contraseña
 -> jsonwebtoken: crea el JWT
 -> cookie session
 -> /
```

### Registro

```text
html/register.html
 -> js/register.js
 -> POST /api/register
 -> api/register.js
 -> lib/db.js
 -> MySQL: valida admin y usuario existente
 -> bcryptjs: hashea la nueva contraseña
 -> MySQL: inserta el usuario
 -> /login
```

### Consulta de sesion

```text
Pagina general
 -> js/main.js
 -> GET /api/me
 -> api/me.js
 -> valida cookie session
 -> actualiza el menu de la pagina
```

### Cierre de sesion

```text
Menu de usuario
 -> js/main.js
 -> POST /api/logout
 -> api/logout.js
 -> elimina cookie session
 -> /
```

## 7. Observacion sobre `lib/db.js`

La configuracion esperada es que `lib/db.js` contenga solamente la creacion y
exportacion del pool MySQL, mientras que `api/test-db.js` contenga el endpoint
de prueba.

Al revisar el contenido actual, `lib/db.js` tambien parece incluir codigo del
endpoint de prueba antes de la configuracion del pool. Conviene separar esas
responsabilidades para evitar una referencia circular o una exportacion
ambigua:

- `lib/db.js`: solo pool MySQL.
- `api/test-db.js`: solo prueba `SELECT 1 AS conexion`.

## 8. Rutas publicas y configuracion de Vercel

`vercel.json` contiene las reglas internas que conectan las rutas publicas con
los archivos HTML almacenados dentro de `html/`.

Se usa `/equipos` en vez de `equipos.html` para presentar una URL limpia al
usuario y mantener separada la estructura interna de archivos. `equipos.html`
es el nombre del archivo fisico guardado en `html/`; no representa una ruta que
deba verse obligatoriamente en la barra del navegador. La forma tradicional
`equipos.html` tambien podria funcionar localmente o mediante una ruta directa,
pero mostraria la organizacion del proyecto y no daria una URL uniforme.

Cuando alguien visita `/equipos`, Vercel recibe el dominio y aplica la
`rewrites` definida en `vercel.json`. Esa regla entrega internamente
`html/equipos.html` sin cambiar la URL visible a `/html/equipos.html`.

Ejemplo del flujo:

```text
Enlace: /equipos
  -> vercel.json
  -> destino interno: html/equipos.html
  -> navegador conserva: /equipos
```

El archivo `js/navigation.js` adapta los enlaces para Live Server. En localhost
convierte `/equipos` a `equipos.html`, porque Live Server abre directamente los
archivos locales y no interpreta las rewrites de Vercel. En Vercel conserva
`/equipos`.

- `/`: entrega `html/index.html`.
- `/equipos`: entrega `html/equipos.html`.
- `/tabla-de-juego`: entrega `html/tabla-de-juego.html`.
- `/reglamento`: entrega `html/reglamento.html`.
- `/search`: entrega `html/search.html`.
- `/login`: entrega `html/login.html`.
- `/register`: entrega `html/register.html`.

Las rutas con barra final tambien se aceptan. Los usuarios ven las rutas
publicas sin `/html` porque `rewrites` resuelve internamente la direccion real.
