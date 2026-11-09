
const db = require("../lib/db");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    try {
        const {
            username,
            userid,
            password,
            adminPassword
        } = req.body || {};

        // Validar que todos los datos sean textos
        if (
            typeof username !== "string" ||
            typeof userid !== "string" ||
            typeof password !== "string" ||
            typeof adminPassword !== "string"
        ) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        const cleanUsername = username.trim();
        const cleanUserid = userid.trim();

        // Validar nombre
        if (
            cleanUsername.length < 3 ||
            cleanUsername.length > 255
        ) {
            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 255 caracteres"
            });
        }

        // Validar identificación
        if (!/^\d{1,20}$/.test(cleanUserid)) {
            return res.status(400).json({
                message: "El ID debe contener solamente números"
            });
        }

        // Validar contraseña personal
        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 8 caracteres y máximo 72 bytes"
            });
        }

        // Validar contraseña del administrador
        if (
            adminPassword.length === 0 ||
            Buffer.byteLength(adminPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "La contraseña de autorización no es válida"
            });
        }

        // Buscar las contraseñas cifradas de los administradores
        const [admins] = await db.execute(
            "SELECT `password` FROM `usuarios` WHERE role = ?",
            ["admin"]
        );

        if (admins.length === 0) {
            return res.status(403).json({
                message: "No existe un administrador autorizado"
            });
        }

        // Comprobar la contraseña introducida contra los hashes
        let autorizado = false;

        for (const admin of admins) {
            const coincide = await bcrypt.compare(
                adminPassword,
                admin.password
            );

            if (coincide) {
                autorizado = true;
                break;
            }
        }

        if (!autorizado) {
            return res.status(403).json({
                message: "Contraseña de administrador incorrecta"
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

        // Cifrar la contraseña personal del nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear usuario: nunca permitir que el registro público
        // decida su propio rol.
        const [result] = await db.execute(
            `INSERT INTO usuarios
            (username, userid, password, role)
            VALUES (?, ?, ?, ?)`,
            [
                cleanUsername,
                cleanUserid,
                hashedPassword,
                "user"
            ]
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
        console.error(
            "Error en registro:",
            error.code || error.message
        );

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
