
const jwt = require("jsonwebtoken");

// Comprueba la cookie creada por api/login.js y devuelve la sesión actual.
// La usa js/main.js para mostrar el nombre del usuario en el menú.
module.exports = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    try {
        const cookies = req.headers.cookie || "";

        const sessionCookie = cookies
            .split(";")
            .map(cookie => cookie.trim())
            .find(cookie => cookie.startsWith("session="));

        if (!sessionCookie) {
            return res.status(401).json({
                authenticated: false
            });
        }

        const token = sessionCookie.substring("session=".length);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        return res.status(200).json({
            authenticated: true,
            user: {
                id: decoded.sub,
                userid: decoded.userid,
                username: decoded.username,
                role: decoded.role
            }
        });

    } catch (error) {
        return res.status(401).json({
            authenticated: false,
            message: "Sesión inválida o expirada"
        });
    }
};
