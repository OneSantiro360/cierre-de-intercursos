// Obtiene los elementos del formulario para leer datos, mostrar mensajes y controlar el botón.
const formulario = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btnLogin");

// Intercepta el envío; valida los campos y solicita al servidor iniciar la sesión.
formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Obtiene el número de identificación y elimina espacios exteriores.
    const userid = document.getElementById("userid").value.trim();

    // Obtiene la contraseña del campo correspondiente sin modificarla.
    const password = document.getElementById("password").value;

    mensaje.textContent = "";
    mensaje.style.color = "#ff7777";

    // Valida que la identificación contenga únicamente números con una longitud permitida.
    if (!/^\d{1,20}$/.test(userid)) {
        mensaje.textContent = "Ingrese un número de identificación válido";
        return;
    }

    if (!password) {
        mensaje.textContent = "Ingrese su contraseña";
        return;
    }

    boton.disabled = true;
    boton.textContent = "Verificando...";

    // El try agrupa las operaciones que dependen del servidor y pueden fallar.
    // Si aparece un error de red, JSON o autenticación, el flujo pasa a catch.
    try {

        // fetch realiza la solicitud HTTP al endpoint /api/login.
        // await hace que el código espere la respuesta antes de continuar.
        const respuesta = await fetch("/api/login", {
            // POST indica que se envían datos para iniciar una operación.
            method: "POST",

            // Content-Type informa al servidor que el cuerpo fue escrito como JSON.
            headers: {
                "Content-Type": "application/json"
            },

            // same-origin permite enviar y recibir cookies creadas por este mismo sitio.
            credentials: "same-origin",

            // JSON.stringify transforma el objeto JavaScript en texto JSON.
            // El servidor lo recibe dentro de req.body como userid y password.
            body: JSON.stringify({
                userid,
                password
            })
        });

        // respuesta contiene el estado HTTP, pero no el objeto directamente.
        // respuesta.json() convierte el texto recibido por el servidor en objeto JavaScript.
        const resultado = await respuesta.json();

        // ok es true con estados HTTP entre 200 y 299.
        // Si fue false, se usa el mensaje del servidor o un mensaje alternativo.
        if (!respuesta.ok) {
            throw new Error(
                resultado.message ||
                "Identificación o contraseña incorrectos"
            );
        }

        // Cambia la presentación del mensaje para indicar una autenticación correcta.
        mensaje.style.color = "#4CAF50";
        mensaje.textContent = "¡Inicio de sesión exitoso!";

        // Limpia las credenciales escritas después de completar el inicio.
        formulario.reset();

        // Espera 800 ms para que el usuario vea el mensaje antes de cambiar de página.
        setTimeout(() => {
            window.location.href = window.appNavigation?.obtenerUrl("/") || "/";
        }, 800);

    } catch (error) {

        // catch recibe el error generado por throw o producido por la solicitud.
        // El mensaje se muestra sin revelar detalles técnicos al usuario.
        mensaje.style.color = "#ff7777";
        mensaje.textContent = error.message;

    } finally {

        // finally siempre se ejecuta después de try o catch.
        // Reactiva el formulario y restaura el texto del botón.
        boton.disabled = false;
        boton.textContent = "Iniciar sesión";

    }

});
