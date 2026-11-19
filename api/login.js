
// Pool de conexiones compartido para consultar MySQL.
const db = require("../lib/db");
// Compara y verifica contraseñas almacenadas mediante hashes bcrypt.
const bcrypt = require("bcryptjs");
// Crea y verifica tokens JWT usados por la cookie de sesión.
const jwt = require("jsonwebtoken");

// Recibe las credenciales enviadas por js/login.js y crea la sesión.
module.exports = async (req, res) => {
    // Solo permite el envío de credenciales mediante POST.
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método no permitido"
        });
    }

    try {
        // req.body contiene el JSON convertido por el servidor desde el fetch del navegador.
        const { userid, password } = req.body || {};

        // Valida tipos y formatos antes de consultar MySQL o comparar contraseñas.
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

        // Busca al usuario por identificación y limita el resultado a una coincidencia.
        const [users] = await db.execute(
            "SELECT id, username, userid, `password`, role FROM `usuarios` WHERE userid = ? LIMIT 1",
            [userid.trim()]
        );

        if (users.length === 0) {
            // Se evita informar si el ID existe por separado para no facilitar el reconocimiento.
            return res.status(401).json({
                message: "ID o contraseña incorrectos"
            });
        }

        // users es una lista; esta constante extrae el único usuario esperado.
        const user = users[0];

        // Compara la contraseña escrita con el hash almacenado en MySQL.
        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            // Usa el mismo mensaje que el caso de ID inexistente.
            return res.status(401).json({
                message: "ID o contraseña incorrectos"
            });
        }

        if (!process.env.JWT_SECRET) {
            // Sin clave privada no se debe crear una sesión firmada.
            throw new Error("JWT_SECRET no está configurado");
        }

        // Crea un JWT con los datos básicos necesarios para identificar al usuario.
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

        // Envía el JWT como cookie.
        // HttpOnly protege el token de JavaScript; Secure exige HTTPS;
        // SameSite=Lax controla su envío entre sitios y Max-Age define siete días.
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
        // Oculta fallos internos de MySQL o JWT y devuelve un mensaje general.
        console.error("Error en login:", error);

        return res.status(500).json({
            message: "Error interno al iniciar sesión"
        });
    }
};
