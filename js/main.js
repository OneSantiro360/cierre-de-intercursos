const loginLinks = document.querySelectorAll('a[href="login.html"]');
const mobileMenus = document.querySelectorAll(".nav-left");

function crearIconoSesion() {
    const icono = document.createElement("i");

    icono.className = "fa-solid fa-user-check";
    icono.setAttribute("aria-hidden", "true");

    return icono;
}

function actualizarMenuSesion(usuario) {
    loginLinks.forEach((enlace) => {
        enlace.replaceChildren(crearIconoSesion());

        enlace.title = `Sesión iniciada como ${usuario.username}`;
        enlace.setAttribute(
            "aria-label",
            `Sesión iniciada como ${usuario.username}`
        );
    });

    mobileMenus.forEach((menu) => {
        const usuarioAnterior = menu.querySelector(".user-menu-name");

        if (usuarioAnterior) {
            usuarioAnterior.remove();
        }

        const elementoUsuario = document.createElement("li");

        elementoUsuario.className = "user-menu-name";
        elementoUsuario.textContent = `Sesión: ${usuario.username}`;

        menu.prepend(elementoUsuario);
    });
}

async function cargarSesion() {
    try {
        const respuesta = await fetch("/api/me", {
            credentials: "same-origin"
        });

        if (!respuesta.ok) {
            return;
        }

        const resultado = await respuesta.json();

        if (resultado.authenticated && resultado.user?.username) {
            actualizarMenuSesion(resultado.user);
        }
    } catch (error) {
        console.error("No se pudo consultar la sesión:", error);
    }
}

cargarSesion();
