const formulario = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btnRegistro");

formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const userid = document.getElementById("userid").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
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

    try {

        const respuesta = await fetch("/api/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                username,
                userid,
                password,
                adminPassword
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.message || "No se pudo registrar"
            );
        }

        mensaje.style.color = "#4CAF50";
        mensaje.textContent = "¡Registro exitoso! Redirigiendo...";

        formulario.reset();

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 1200);

    } catch (error) {

        mensaje.style.color = "#ff7777";
        mensaje.textContent = error.message;

    } finally {

        boton.disabled = false;
        boton.textContent = "Registrarme";

    }

});
