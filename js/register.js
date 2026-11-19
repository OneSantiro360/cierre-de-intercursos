// Obtiene los elementos del formulario de registro y sus controles visuales.
const formulario = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btnRegistro");

// Intercepta el registro; valida los datos y los envía al endpoint /api/register.
formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Busca el campo con id="username", lee su texto y elimina espacios al inicio y final.
    const username = document.getElementById("username").value.trim();

    // Obtiene la identificación escrita y elimina espacios antes de validarla.
    const userid = document.getElementById("userid").value.trim();

    // Lee exactamente la contraseña principal sin modificar ni almacenar su texto.
    const password = document.getElementById("password").value;

    // Lee la contraseña repetida para comprobar que ambas sean idénticas.
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Lee la clave de autorización necesaria para permitir el registro público.
    const adminPassword = document.getElementById("adminPassword").value;

    mensaje.textContent = "";
    mensaje.style.color = "#ff7777";

    if (!/^\d{1,20}$/.test(userid)) {
        mensaje.textContent = "Ingrese un número de identificación válido";
        return;
    }

    if (password !== confirmPassword) {
        mensaje.textContent = "Las contraseñas no coinciden";
        return;
    }

    if (!adminPassword.trim()) {
        mensaje.textContent = "Debe ingresar la contraseña de autorización";
        return;
    }

    boton.disabled = true;
    boton.textContent = "Registrando...";

    // try incluye la comunicación con el servidor y todo lo que puede producir un error.
    try {

        // Solicita al endpoint de registro mediante POST y espera su respuesta.
        const respuesta = await fetch("/api/register", {
            method: "POST",

            // Indica que el contenido enviado está escrito como JSON.
            headers: {
                "Content-Type": "application/json"
            },

            // Permite incluir las cookies del dominio actual si el servidor las necesita.
            credentials: "same-origin",

            // Convierte los datos del formulario en un objeto JSON enviado al servidor.
            body: JSON.stringify({
                username,
                userid,
                password,
                adminPassword
            })
        });

        // Convierte el cuerpo textual de la respuesta HTTP en un objeto JavaScript.
        const resultado = await respuesta.json();

        // respuesta.ok será false para respuestas como 400, 409 o 500.
        if (!respuesta.ok) {
            throw new Error(
                resultado.message || "No se pudo registrar"
            );
        }

        // Confirma visualmente el registro y permite que el usuario lea el mensaje.
        mensaje.style.color = "#4CAF50";
        mensaje.textContent = "¡Registro exitoso! Redirigiendo...";

        formulario.reset();

        // Tras esperar 1.2 segundos, lleva al usuario a iniciar sesión.
        setTimeout(() => {
            window.location.href = window.appNavigation?.obtenerUrl("/login") || "/login";
        }, 1200);

    } catch (error) {

        // Error contiene el mensaje generado por throw o por una falla de la solicitud.
        mensaje.style.color = "#ff7777";
        mensaje.textContent = error.message;

    } finally {

        boton.disabled = false;
        boton.textContent = "Registrarme";

    }

});
