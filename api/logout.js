
/*
 * Endpoint de cierre de sesión.
 * js/main.js llama a /api/logout al pulsar "Cerrar sesión".
 */
module.exports = async (req, res) => {
    // Permite únicamente solicitudes POST para impedir cambios por enlaces o visitas GET.
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    // Reemplaza la cookie de sesión por una cookie vacía que vence inmediatamente.
    // HttpOnly impide leerla desde JavaScript; Secure exige HTTPS; SameSite=Lax
    // permite el uso normal sin enviar la cookie en solicitudes externas inseguras.
    res.setHeader("Set-Cookie", [
        "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    ]);

    return res.status(200).json({
        message: "Sesión cerrada correctamente"
    });
};
