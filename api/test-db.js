
// db reutiliza la conexión MySQL creada en lib/db.js.
const db = require("../lib/db");

/*
 * Prueba la conexión usada por los otros archivos de api/.
 * Ejecuta una consulta mínima y devuelve si MySQL respondió correctamente.
 */
module.exports = async (req, res) => {
    try {
        // db.query ejecuta SQL real; "SELECT 1" obliga a MySQL a responder sin modificar datos.
        const [result] = await db.query("SELECT 1 AS conexion");

        return res.status(200).json({
            success: true,
            message: "Conexión con Railway MySQL exitosa",
            database: result[0].conexion
        });

    } catch (error) {
        console.error("Error de conexión:", error.code || error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo conectar con MySQL"
        });
    }
};
