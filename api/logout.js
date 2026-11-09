
module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    res.setHeader("Set-Cookie", [
        "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    ]);

    return res.status(200).json({
        message: "Sesión cerrada correctamente"
    });
};
