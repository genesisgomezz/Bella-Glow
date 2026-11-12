import { Router } from "express";
import multer from "multer";
import { createHash } from "node:crypto";
import pool from "../confit/database";
import {
  verificarToken,
  permitirRoles,
} from "../middlewares/auth.middleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error("Formato no permitido. Usa JPG, PNG, WEBP o GIF.")
      );
    }
  },
});

async function subirACloudinary(
  archivo: Express.Multer.File
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary no está configurado. Revisa las variables de entorno del backend."
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "bella-glow/productos";

  const parametrosFirmados = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(`${parametrosFirmados}${apiSecret}`)
    .digest("hex");

  const formulario = new FormData();
  const archivoBlob = new Blob([new Uint8Array(archivo.buffer)], {
    type: archivo.mimetype,
  });

  formulario.append("file", archivoBlob, archivo.originalname);
  formulario.append("api_key", apiKey);
  formulario.append("timestamp", String(timestamp));
  formulario.append("folder", folder);
  formulario.append("signature", signature);

  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formulario,
    }
  );

  const resultado = (await respuesta.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!respuesta.ok || !resultado.secure_url) {
    console.error("Error de Cloudinary:", resultado.error?.message);
    throw new Error(
      resultado.error?.message || "Cloudinary no pudo guardar la imagen."
    );
  }

  return resultado.secure_url;
}

router.post(
  "/subir-imagen",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  (req, res) => {
    upload.single("imagen")(req, res, async (error) => {
      if (error) {
        const mensaje =
          error instanceof multer.MulterError
            ? error.code === "LIMIT_FILE_SIZE"
              ? "La imagen no puede superar los 5 MB."
              : error.message
            : error.message;

        res.status(400).json({ mensaje });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          mensaje: "Debes seleccionar una imagen.",
        });
        return;
      }

      try {
        const urlImagen = await subirACloudinary(req.file);

        res.status(201).json({
          mensaje: "Imagen subida correctamente a Cloudinary.",
          imagen: urlImagen,
        });
      } catch (error) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({
          mensaje:
            error instanceof Error
              ? error.message
              : "No se pudo subir la imagen.",
        });
      }
    });
  }
);

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.categoria_id,
        c.nombre AS categoria,
        p.descripcion,
        p.precio,
        p.imagen,
        p.stock,
        p.estado
      FROM productos p
      INNER JOIN categorias c
        ON p.categoria_id = c.id
      WHERE p.estado = 1
      ORDER BY p.id
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al consultar productos:", error);
    res.status(500).json({
      mensaje: "No se pudieron consultar los productos.",
    });
  }
});

router.post(
  "/",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (req, res) => {
    try {
      const {
        nombre,
        categoria_id,
        descripcion,
        precio,
        imagen,
        stock,
      } = req.body;

      if (
        !nombre ||
        !categoria_id ||
        precio === undefined ||
        stock === undefined
      ) {
        res.status(400).json({
          mensaje: "Nombre, categoría, precio y stock son obligatorios.",
        });
        return;
      }

      const [resultado] = await pool.query(
        `INSERT INTO productos
         (nombre, categoria_id, descripcion, precio, imagen, stock, estado)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          nombre,
          categoria_id,
          descripcion ?? "",
          precio,
          imagen ?? "",
          stock,
        ]
      );

      const nuevoProducto = resultado as { insertId: number };

      res.status(201).json({
        mensaje: "Producto registrado correctamente.",
        id: nuevoProducto.insertId,
      });
    } catch (error) {
      console.error("Error al registrar producto:", error);
      res.status(500).json({
        mensaje: "No se pudo registrar el producto.",
      });
    }
  }
);

router.put(
  "/:id",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombre,
        categoria_id,
        descripcion,
        precio,
        imagen,
        stock,
      } = req.body;

      if (
        !nombre ||
        !categoria_id ||
        precio === undefined ||
        stock === undefined
      ) {
        res.status(400).json({
          mensaje: "Nombre, categoría, precio y stock son obligatorios.",
        });
        return;
      }

      const [resultado] = await pool.query(
        `UPDATE productos
         SET nombre = ?,
             categoria_id = ?,
             descripcion = ?,
             precio = ?,
             imagen = ?,
             stock = ?
         WHERE id = ? AND estado = 1`,
        [
          nombre,
          categoria_id,
          descripcion ?? "",
          precio,
          imagen ?? "",
          stock,
          id,
        ]
      );

      const actualizacion = resultado as { affectedRows: number };

      if (actualizacion.affectedRows === 0) {
        res.status(404).json({
          mensaje: "Producto no encontrado.",
        });
        return;
      }

      res.json({
        mensaje: "Producto actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error al modificar producto:", error);
      res.status(500).json({
        mensaje: "No se pudo modificar el producto.",
      });
    }
  }
);

router.delete(
  "/:id",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [resultado] = await pool.query(
        `UPDATE productos
         SET estado = 0
         WHERE id = ? AND estado = 1`,
        [id]
      );

      const eliminacion = resultado as { affectedRows: number };

      if (eliminacion.affectedRows === 0) {
        res.status(404).json({
          mensaje: "Producto no encontrado.",
        });
        return;
      }

      res.json({
        mensaje: "Producto eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({
        mensaje: "No se pudo eliminar el producto.",
      });
    }
  }
);

export default router;
