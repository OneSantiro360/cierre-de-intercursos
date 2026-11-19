const loginLinks = document.querySelectorAll('a[href="/login"], a[href="login.html"]');
const mobileMenus = document.querySelectorAll(".nav-left");

// Esta función crea el icono de usuario que reemplaza al enlace de inicio de sesión.
function crearIconoSesion() {
    const icono = document.createElement("i");

    icono.className = "fa-solid fa-circle-user";
    icono.setAttribute("aria-hidden", "true");

    return icono;
}

async function cerrarSesion(boton) {
    // Envía la solicitud de cierre de sesión a api/logout.js.
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

        window.location.href = window.appNavigation?.obtenerUrl("/") || "/";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        boton.disabled = false;
        boton.textContent = "Cerrar sesión";
    }
}

function crearMenuSesion(usuario, enlace) {
    // Cambia el enlace de Login por el icono y el menú del usuario.
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

    const padre = enlace.parentElement;

    padre.replaceChild(contenedor, enlace);

    contenedor.append(enlace, menu);

    document.addEventListener("click", (evento) => {
        if (!contenedor.contains(evento.target)) {
            menu.hidden = true;
        }
    });
}

function actualizarMenuSesion(usuario) {
    // Actualiza el menú de escritorio y agrega el nombre al menú móvil.
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
    // Consulta api/me.js para saber si existe una sesión activa.
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
