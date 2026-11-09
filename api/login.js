
const db = require("../lib/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    try {
        const { userid, password } = req.body || {};

        if (
            typeof userid !== "string" ||
            typeof password !== "string" ||
            !/^\d{1,20}$/.test(userid.trim()) ||
            password.length === 0 ||
            password.length > 72
        ) {
            return res.status(400).json({
                message: "Credenciales inválidas"
            });
        }

        // Buscar usuario
        const [users] = await db.execute(
            "SELECT id, username, userid, `password`, role FROM `Usuarios` WHERE userid = ? LIMIT 1",
            [userid.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "ID o contraseña incorrectos"
            });
        }

        const user = users[0];

        // Comparar contraseña
        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "ID o contraseña incorrectos"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET no está configurado");
        }

        // Crear token
        const token = jwt.sign(
            {
                sub: String(user.id),
                userid: String(user.userid),
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
                algorithm: "HS256"
            }
        );

        // Guardar token en cookie segura
        res.setHeader("Set-Cookie", [
            `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
        ]);

        return res.status(200).json({
            message: "Inicio de sesión correcto",
            user: {
                id: user.id,
                username: user.username,
                userid: String(user.userid),
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error en login:", error);

        return res.status(500).json({
            message: "Error interno al iniciar sesión"
        });
    }
};
