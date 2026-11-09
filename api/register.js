
const db = require("../lib/db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    try {
        const { username, userid, password } = req.body || {};

        if (
            typeof username !== "string" ||
            typeof userid !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Datos inválidos"
            });
        }

        const cleanUsername = username.trim();
        const cleanUserid = userid.trim();

        if (cleanUsername.length < 3 || cleanUsername.length > 255) {
            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 255 caracteres"
            });
        }

        if (!/^\d{1,20}$/.test(cleanUserid)) {
            return res.status(400).json({
                message: "El ID debe contener solamente números"
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 8 caracteres y máximo 72 bytes"
            });
        }

        // Comprobar si el ID ya está registrado
        const [existing] = await db.execute(
            "SELECT id FROM `usuarios` WHERE userid = ? LIMIT 1",
            [cleanUserid]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Este número de usuario ya está registrado"
            });
        }

        // Crear hash seguro de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Todos los registros públicos comienzan como usuarios normales
        const [result] = await db.execute(
            "INSERT INTO `usuarios` (username, userid, `password`, role) VALUES (?, ?, ?, ?)",
            [cleanUsername, cleanUserid, hashedPassword, "user"]
        );

        return res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente",
            user: {
                id: result.insertId,
                username: cleanUsername,
                userid: cleanUserid,
                role: "user"
            }
        });

    } catch (error) {
        console.error("Error en registro:", error.code || error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Este número de usuario ya está registrado"
            });
        }

        return res.status(500).json({
            message: "Error interno al registrar el usuario"
        });
    }
};
