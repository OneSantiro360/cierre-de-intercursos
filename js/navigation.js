// Lista las rutas públicas y el nombre real del archivo HTML que les corresponde.
const rutasPublicas = {
    "/": "index.html",
    "/equipos": "equipos.html",
    "/tabla-de-juego": "tabla-de-juego.html",
    "/reglamento": "reglamento.html",
    "/search": "search.html",
    "/login": "login.html",
    "/register": "register.html"
};

// Identifica Live Server o un servidor local por el nombre del host.
const esEntornoLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

// Convierte una ruta pública a su archivo local solo durante el desarrollo.
function obtenerUrl(ruta) {
    if (!esEntornoLocal) {
        return ruta;
    }

    return rutasPublicas[ruta] || ruta;
}

// Expone la función de navegación para que los demás archivos JavaScript puedan usarla.
window.appNavigation = { obtenerUrl };

// Reemplaza las rutas públicas por nombres de archivos cuando la página se abre localmente.
if (esEntornoLocal) {
    document.querySelectorAll("a[href]").forEach((enlace) => {
        const ruta = enlace.getAttribute("href");

        if (rutasPublicas[ruta]) {
            enlace.href = obtenerUrl(ruta);
        }
    });
}
