
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
