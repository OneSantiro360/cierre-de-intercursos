
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
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

module.exports = pool;