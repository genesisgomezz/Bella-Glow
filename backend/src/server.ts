
import express from "express";
import cors from "cors";
import path from "node:path";
import { probarConexion } from "./confit/database";
import productosRoutes from "./routes/productos.routes";
import categoriasRoutes from "./routes/categorias.routes";
import authRoutes from "./routes/auth.routes";
import pedidosRoutes from "./routes/pedidos.routes";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/pedidos", pedidosRoutes);

app.get("/", (_req, res) => {
  res.json({
    mensaje: "API de Bella Glow Cosmetics funcionando",
  });
});

app.get("/api/salud", async (_req, res) => {
  try {
    await probarConexion();
    res.json({
      estado: "correcto",
      mensaje: "API y conexión con la base de datos funcionando",
    });
  } catch (error) {
    console.error("Error al conectar con MySQL:", error);
    res.status(500).json({
      estado: "error",
      mensaje: "No se pudo conectar con la base de datos",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Bella Glow activo en http://localhost:${PORT}`);
});
