// Abre o cierra la lista de navegación móvil al pulsar el botón principal.
document.querySelector(".menu-btn").addEventListener("click", () => {
    document.querySelector(".nav-left").classList.toggle("show");
});

// Cambia el dibujo del botón hamburguesa para reflejar visualmente su estado.
document.querySelector(".menu-btn").addEventListener("click", () => {
    document.querySelector(".menu-1").classList.toggle("show");
});
