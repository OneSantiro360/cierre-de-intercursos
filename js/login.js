const formulario = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btnLogin");

formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    const userid = document.getElementById("userid").value.trim();
    const password = document.getElementById("password").value;

    mensaje.textContent = "";
    mensaje.style.color = "#ff7777";

    // Validar identificación
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

    try {

        const respuesta = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                userid,
                password
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.message ||
                "Identificación o contraseña incorrectos"
            );
        }

        mensaje.style.color = "#4CAF50";
        mensaje.textContent = "¡Inicio de sesión exitoso!";

        formulario.reset();

        setTimeout(() => {
            window.location.href = "/index.html";
        }, 800);

    } catch (error) {

        mensaje.style.color = "#ff7777";
        mensaje.textContent = error.message;

    } finally {

        boton.disabled = false;
        boton.textContent = "Iniciar sesión";

    }

});
