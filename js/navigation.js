const rutasPublicas = {
    "/": "index.html",
    "/equipos": "equipos.html",
    "/tabla-de-juego": "tabla-de-juego.html",
    "/reglamento": "reglamento.html",
    "/search": "search.html",
    "/login": "login.html",
    "/register": "register.html"
};

const esEntornoLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

function obtenerUrl(ruta) {
    if (!esEntornoLocal) {
        return ruta;
    }

    return rutasPublicas[ruta] || ruta;
}

window.appNavigation = { obtenerUrl };

if (esEntornoLocal) {
    document.querySelectorAll("a[href]").forEach((enlace) => {
        const ruta = enlace.getAttribute("href");

        if (rutasPublicas[ruta]) {
            enlace.href = obtenerUrl(ruta);
        }
    });
}
