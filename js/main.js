// Obtiene todos los enlaces de inicio de sesión para reemplazarlos si existe una sesión.
const loginLinks = document.querySelectorAll('a[href="/login"], a[href="login.html"]');

// Identifica la navegación izquierda móvil donde se mostrará el nombre del usuario.
const mobileMenus = document.querySelectorAll(".nav-left");

// Esta función crea el icono de usuario que reemplaza al enlace de inicio de sesión.
function crearIconoSesion() {
    // Crea el elemento visual que reemplazará al texto "Login".
    const icono = document.createElement("i");

    icono.className = "fa-solid fa-circle-user";
    icono.setAttribute("aria-hidden", "true");

    return icono;
}

async function cerrarSesion(boton) {
    // Deshabilita el botón y cambia su texto para evitar varios cierres simultáneos.
    boton.disabled = true;
    boton.textContent = "Cerrando sesión...";

    // try contiene la solicitud HTTP y la redirección que dependen del servidor.
    try {
        // POST ejecuta el cierre; credentials permite que el navegador envíe la cookie.
        const respuesta = await fetch("/api/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        // Si la API no confirmó el cierre, se genera un error controlado.
        if (!respuesta.ok) {
            throw new Error("No se pudo cerrar la sesión");
        }

        // Cambia a la portada usando la ruta correcta en localhost o Vercel.
        window.location.href = window.appNavigation?.obtenerUrl("/") || "/";
    } catch (error) {
        // Conserva el botón visible si el servidor no pudo cerrar la sesión.
        console.error("Error al cerrar sesión:", error);
        boton.disabled = false;
        boton.textContent = "Cerrar sesión";
    }
}

function crearMenuSesion(usuario, enlace) {
    // Reemplaza el enlace de Login por un menú desplegable con el usuario y la opción de salir.
    // contenedor agrupa el enlace del usuario y su menú para controlarlos juntos.
    const contenedor = document.createElement("li");
    contenedor.className = "session-container";

    // menu contiene el nombre y el botón de cierre; hidden lo mantiene oculto al inicio.
    const menu = document.createElement("div");
    menu.className = "session-dropdown";
    menu.hidden = true;

    // nombre muestra el usuario obtenido de la API /api/me.
    const nombre = document.createElement("p");
    nombre.textContent = usuario.username;

    // botonCerrarSesion permite ejecutar la solicitud de cierre al hacer clic.
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

    // padre es el elemento <li> o contenedor original que contiene el enlace.
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
    // Actualiza el menú de escritorio y agrega el nombre del usuario al menú móvil.
    loginLinks.forEach((enlace) => {
        crearMenuSesion(usuario, enlace);
    });

    mobileMenus.forEach((menu) => {
        // Busca una etiqueta de usuario añadida anteriormente para evitar duplicarla.
        const usuarioAnterior = menu.querySelector(".user-menu-name");

        if (usuarioAnterior) {
            usuarioAnterior.remove();
        }

        // Crea una fila nueva que mostrará "Sesión: nombre" dentro del menú móvil.
        const elementoUsuario = document.createElement("li");

        elementoUsuario.className = "user-menu-name";
        elementoUsuario.textContent = `Sesión: ${usuario.username}`;

        menu.prepend(elementoUsuario);
    });
}

async function cargarSesion() {
    // Consulta /api/me para saber si existe una sesión activa y actualiza la interfaz si corresponde.
    try {
        // GET recupera la sesión guardada en la cookie; no se modifican datos.
        const respuesta = await fetch("/api/me", {
            credentials: "same-origin"
        });

        // Sin una respuesta exitosa, se mantiene la navegación normal sin iniciar sesión.
        if (!respuesta.ok) {
            return;
        }

        // Convierte el JSON devuelto por el servidor en un objeto usable por JavaScript.
        const resultado = await respuesta.json();

        // Solo reemplaza el enlace si la API confirmó autenticación y encontró un nombre.
        if (resultado.authenticated && resultado.user?.username) {
            actualizarMenuSesion(resultado.user);
        }
    } catch (error) {
        console.error("No se pudo consultar la sesión:", error);
    }
}

cargarSesion();
