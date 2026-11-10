const loginLinks = document.querySelectorAll('a[href="login.html"]');
const mobileMenus = document.querySelectorAll(".nav-left");

function crearIconoSesion() {
    const icono = document.createElement("i");

    icono.className = "fa-solid fa-user-check";
    icono.setAttribute("aria-hidden", "true");

    return icono;
}

async function cerrarSesion(boton) {
    boton.disabled = true;
    boton.textContent = "Cerrando sesión...";

    try {
        const respuesta = await fetch("/api/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo cerrar la sesión");
        }

        window.location.href = "/index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        boton.disabled = false;
        boton.textContent = "Cerrar sesión";
    }
}

function crearMenuSesion(usuario, enlace) {
    const contenedor = document.createElement("li");
    contenedor.className = "session-container";

    const menu = document.createElement("div");
    menu.className = "session-dropdown";
    menu.hidden = true;

    const nombre = document.createElement("p");
    nombre.textContent = usuario.username;

    const botonCerrarSesion = document.createElement("button");
    botonCerrarSesion.type = "button";
    botonCerrarSesion.textContent = "Cerrar sesión";

    botonCerrarSesion.addEventListener("click", () => {
        cerrarSesion(botonCerrarSesion);
    });

    menu.append(nombre, botonCerrarSesion);

    enlace.replaceChildren(crearIconoSesion());
    enlace.href = "#";
    enlace.title = `Sesión iniciada como ${usuario.username}`;

    enlace.addEventListener("click", (evento) => {
        evento.preventDefault();
        menu.hidden = !menu.hidden;
    });

    contenedor.append(enlace, menu);
    enlace.replaceWith(contenedor);

    document.addEventListener("click", (evento) => {
        if (!contenedor.contains(evento.target)) {
            menu.hidden = true;
        }
    });
}

function actualizarMenuSesion(usuario) {
    loginLinks.forEach((enlace) => {
        crearMenuSesion(usuario, enlace);
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
