// Contiene las páginas y categorías que aparecerán como resultados de búsqueda.
const datosBusqueda = [
    { titulo: "Inicio", descripcion: "Página principal de los juegos intercursos", ruta: "/" },
    { titulo: "Equipos", descripcion: "Lista de cursos y equipos participantes", ruta: "/equipos" },
    { titulo: "Tabla de juego", descripcion: "Resultados y partidos de los deportes", ruta: "/tabla-de-juego" },
    { titulo: "Reglamento", descripcion: "Normas y reglas de los intercursos", ruta: "/reglamento" },
    { titulo: "Futsal masculino", descripcion: "Resultados y partidos de futsal masculino", ruta: "/tabla-de-juego#futsal-masculino" },
    { titulo: "Futsal femenino", descripcion: "Resultados y partidos de futsal femenino", ruta: "/tabla-de-juego#futsal-femenino" },
    { titulo: "Voleibol", descripcion: "Resultados y partidos de voleibol", ruta: "/tabla-de-juego#voleibol" },
    { titulo: "Tenis de mesa", descripcion: "Resultados y partidos de tenis de mesa", ruta: "/tabla-de-juego#tenis-de-mesa" }
];

// Lista los cursos que aparecen en la página Equipos.
const cursos = [
    "601", "602", "603",
    "701", "702", "703",
    "801", "802", "803",
    "901", "902", "903",
    "1001", "1002", "1003", "1004",
    "1101", "1102", "1103",
    "Complementario"
];

cursos.forEach((curso) => {
    datosBusqueda.push({
        titulo: curso === "Complementario" ? "Complementario" : `Curso ${curso}`,
        descripcion: "Equipo participante en los juegos intercursos",
        ruta: "/equipos"
    });
});

// Obtiene el campo de texto y el contenedor donde se mostrarán los resultados.
const campoBusqueda = document.getElementById("s");
const contenedorResultados = document.getElementById("search-results");

// Normaliza el texto para ignorar mayúsculas, acentos y espacios exteriores.
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Convierte una ruta pública en el nombre local de HTML al usar Live Server.
function obtenerRuta(item) {
    return window.appNavigation?.obtenerUrl(item.ruta) || item.ruta;
}

// Filtra los datos y crea un enlace por cada coincidencia encontrada.
function mostrarResultados() {
    const termino = normalizarTexto(campoBusqueda.value);

    // Borra resultados anteriores para evitar que coincidan búsquedas distintas.
    contenedorResultados.replaceChildren();

    // El buscador no muestra sugerencias mientras el campo esté vacío.
    if (!termino) {
        return;
    }

    // Busca dentro del título y la descripción de cada elemento.
    const coincidencias = datosBusqueda.filter((item) => {
        const texto = normalizarTexto(`${item.titulo} ${item.descripcion}`);
        return texto.includes(termino);
    });

    // Informa al usuario cuando no existe una coincidencia.
    if (coincidencias.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "search-empty";
        mensaje.textContent = `No se encontraron resultados para "${campoBusqueda.value.trim()}".`;
        contenedorResultados.append(mensaje);
        return;
    }

    coincidencias.forEach((item) => {
        const enlace = document.createElement("a");
        enlace.className = "search-result";
        enlace.href = obtenerRuta(item);

        const titulo = document.createElement("strong");
        titulo.textContent = item.titulo;

        const descripcion = document.createElement("small");
        descripcion.textContent = item.descripcion;

        enlace.append(titulo, descripcion);
        contenedorResultados.append(enlace);
    });
}

// input se ejecuta con cada tecla; por eso no es necesario presionar Enter.
campoBusqueda.addEventListener("input", mostrarResultados);

// Hace que el icono de lupa coloque el foco en el campo de búsqueda.
const iconoBusqueda = document.querySelector(".search i");

iconoBusqueda.addEventListener("click", () => {
    campoBusqueda.focus();
});
