
const db = require("../lib/db");

module.exports = async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1 AS conexion");

        return res.status(200).json({
            success: true,
            message: "Conexión con Railway MySQL exitosa",
            database: result[0].conexion
        });

    } catch (error) {
        console.error("MYSQL ERROR:", {
            code: error.code,
            errno: error.errno,
            message: error.message
        });

        return res.status(500).json({
            success: false,
            errorCode: error.code || "UNKNOWN",
            message: error.message
        });
    }
};
/*
 * Crea el pool compartido de conexiones MySQL usado por los endpoints de api/.
 * Un pool reutiliza conexiones en lugar de abrir una nueva para cada consulta.
 */
const mysql = require("mysql2/promise");

// Lee las credenciales y los datos de conexión desde las variables de entorno.
const pool = mysql.createPool({
    // Cada opción conecta al MySQL configurado en las variables de entorno de Vercel.
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Espera una conexión disponible en lugar de rechazar inmediatamente.
    waitForConnections: true,
    // Limita el número máximo de conexiones simultáneas para controlar recursos.
    connectionLimit: 5,
    // 0 permite que las solicitudes esperen sin un límite máximo de cola.
    queueLimit: 0
});

module.exports = pool;