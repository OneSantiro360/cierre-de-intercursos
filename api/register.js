
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

        // Validar los datos
        if (!username || !userid || !password) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        if (
            typeof username !== "string" ||
            typeof userid !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Los datos enviados no son válidos"
            });
        }

        const cleanUsername = username.trim();
        const cleanUserid = userid.trim();

        if (!/^\d{1,20}$/.test(cleanUserid)) {
            return res.status(400).json({
                message: "El ID debe contener solamente números"
            });
        }

        if (cleanUsername.length < 3 || cleanUsername.length > 255) {
            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 255 caracteres"
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                message: "La contraseña debe tener entre 8 y 72 caracteres"
            });
        }

        // Comprobar si el ID ya existe
        const [existing] = await db.execute(
            "SELECT id FROM `Usuarios` WHERE userid = ? LIMIT 1",
            [cleanUserid]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Este ID ya está registrado"
            });
        }

        // Proteger la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear el usuario con rol predeterminado
        const [result] = await db.execute(
            "INSERT INTO `Usuarios` (username, userid, `password`, role) VALUES (?, ?, ?, ?)",
            [cleanUsername, cleanUserid, hashedPassword, "user"]
        );

        return res.status(201).json({
            message: "Usuario registrado correctamente",
            user: {
                id: result.insertId,
                username: cleanUsername,
                userid: cleanUserid,
                role: "user"
            }
        });

    } catch (error) {
        console.error("Error en registro:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Este ID ya está registrado"
            });
        }

        return res.status(500).json({
            message: "Error interno al registrar el usuario"
        });
    }
};
