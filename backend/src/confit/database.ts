
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "bella_glow",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function probarConexion(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query("SELECT DATABASE() AS baseDatos");
    console.log("Conexión a MySQL exitosa:", rows);
  } finally {
    connection.release();
  }
}

export default pool;
