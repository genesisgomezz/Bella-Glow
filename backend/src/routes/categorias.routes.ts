import { Router } from "express";
import pool from "../confit/database";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre, descripcion
      FROM categorias
      WHERE estado = 1
      ORDER BY nombre
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al consultar categorías:", error);

    res.status(500).json({
      mensaje: "No se pudieron consultar las categorías"
    });
  }
});

export default router;
