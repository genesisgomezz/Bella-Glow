import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../confit/database";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  verificarToken,
  permitirRoles,
} from "../middlewares/auth.middleware";

const router = Router();

interface Usuario extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "ADMIN" | "EMPLEADO" | "CLIENTE";
  estado: number;
}

function obtenerSecretoJWT(): string {
  const secreto = process.env.JWT_SECRET;

  if (!secreto) {
    throw new Error("Falta configurar JWT_SECRET en el archivo .env");
  }

  return secreto;
}

router.post("/registro", async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (
      typeof nombre !== "string" ||
      typeof correo !== "string" ||
      typeof contrasena !== "string" ||
      !nombre.trim() ||
      !correo.trim() ||
      !contrasena
    ) {
      res.status(400).json({
        mensaje: "Completa el nombre, correo y contraseña.",
      });
      return;
    }

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (nombreLimpio.length > 150 || correoLimpio.length > 150) {
      res.status(400).json({
        mensaje: "El nombre o el correo son demasiado largos.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      res.status(400).json({
        mensaje: "Introduce un correo electrónico válido.",
      });
      return;
    }

    if (
      contrasena.length < 8 ||
      Buffer.byteLength(contrasena, "utf8") > 72
    ) {
      res.status(400).json({
        mensaje:
          "La contraseña debe tener al menos 8 caracteres y un máximo de 72 bytes.",
      });
      return;
    }

    const [existentes] = await pool.execute<Usuario[]>(
      "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
      [correoLimpio]
    );

    if (existentes.length > 0) {
      res.status(409).json({
        mensaje: "Ya existe una cuenta con ese correo.",
      });
      return;
    }

    const hash = await bcrypt.hash(contrasena, 12);

    const [resultado] = await pool.execute<ResultSetHeader>(
      `INSERT INTO usuarios
        (nombre, correo, contrasena, rol, estado)
       VALUES (?, ?, ?, 'CLIENTE', 1)`,
      [nombreLimpio, correoLimpio, hash]
    );

    res.status(201).json({
      mensaje: "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      usuario: {
        id: resultado.insertId,
        nombre: nombreLimpio,
        correo: correoLimpio,
        rol: "CLIENTE",
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      res.status(409).json({
        mensaje: "Ya existe una cuenta con ese correo.",
      });
      return;
    }

    console.error("Error al registrar usuario:", error);

    res.status(500).json({
      mensaje: "No se pudo crear la cuenta.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (
      typeof correo !== "string" ||
      typeof contrasena !== "string" ||
      !correo.trim() ||
      !contrasena
    ) {
      res.status(400).json({
        mensaje: "Introduce tu correo y contraseña.",
      });
      return;
    }

    const correoLimpio = correo.trim().toLowerCase();

    const [usuarios] = await pool.execute<Usuario[]>(
      `SELECT id, nombre, correo, contrasena, rol, estado
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correoLimpio]
    );

    const usuario = usuarios[0];

    if (
      !usuario ||
      !(await bcrypt.compare(contrasena, usuario.contrasena))
    ) {
      res.status(401).json({
        mensaje: "Correo o contraseña incorrectos.",
      });
      return;
    }

    if (Number(usuario.estado) !== 1) {
      res.status(403).json({
        mensaje: "Esta cuenta está desactivada.",
      });
      return;
    }

    const token = jwt.sign(
      { rol: usuario.rol },
      obtenerSecretoJWT(),
      {
        subject: String(usuario.id),
        expiresIn: "2h",
      }
    );

    res.json({
      mensaje: "Inicio de sesión correcto.",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    res.status(500).json({
      mensaje: "No se pudo iniciar sesión.",
    });
  }
});

router.post(
  "/crear-personal",
  verificarToken,
  permitirRoles("ADMIN"),
  async (req, res) => {
    try {
      const { nombre, correo, contrasena, rol } = req.body;

      if (
        typeof nombre !== "string" ||
        typeof correo !== "string" ||
        typeof contrasena !== "string" ||
        !nombre.trim() ||
        !correo.trim() ||
        !contrasena
      ) {
        res.status(400).json({
          mensaje: "Completa el nombre, correo y contraseña.",
        });
        return;
      }

      if (rol !== "ADMIN" && rol !== "EMPLEADO") {
        res.status(400).json({
          mensaje: "El rol debe ser ADMIN o EMPLEADO.",
        });
        return;
      }

      const nombreLimpio = nombre.trim();
      const correoLimpio = correo.trim().toLowerCase();

      if (
        nombreLimpio.length > 150 ||
        correoLimpio.length > 150
      ) {
        res.status(400).json({
          mensaje: "El nombre o el correo son demasiado largos.",
        });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
        res.status(400).json({
          mensaje: "Introduce un correo electrónico válido.",
        });
        return;
      }

      if (
        contrasena.length < 8 ||
        Buffer.byteLength(contrasena, "utf8") > 72
      ) {
        res.status(400).json({
          mensaje:
            "La contraseña debe tener al menos 8 caracteres y un máximo de 72 bytes.",
        });
        return;
      }

      const [existentes] = await pool.execute<Usuario[]>(
        "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
        [correoLimpio]
      );

      if (existentes.length > 0) {
        res.status(409).json({
          mensaje: "Ya existe una cuenta con ese correo.",
        });
        return;
      }

      const hash = await bcrypt.hash(contrasena, 12);

      const [resultado] = await pool.execute<ResultSetHeader>(
        `INSERT INTO usuarios
          (nombre, correo, contrasena, rol, estado)
         VALUES (?, ?, ?, ?, 1)`,
        [nombreLimpio, correoLimpio, hash, rol]
      );

      res.status(201).json({
        mensaje: "Personal creado correctamente.",
        usuario: {
          id: resultado.insertId,
          nombre: nombreLimpio,
          correo: correoLimpio,
          rol,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ER_DUP_ENTRY"
      ) {
        res.status(409).json({
          mensaje: "Ya existe una cuenta con ese correo.",
        });
        return;
      }

      console.error("Error al crear personal:", error);

      res.status(500).json({
        mensaje: "No se pudo crear la cuenta del personal.",
      });
    }
  }
);

router.get(
  "/personal",
  verificarToken,
  permitirRoles("ADMIN"),
  async (_req, res) => {
    try {
      const [usuarios] = await pool.execute<Usuario[]>(
        `SELECT id, nombre, correo, rol, estado
         FROM usuarios
         WHERE rol IN ('ADMIN', 'EMPLEADO')
         ORDER BY nombre ASC`
      );

      res.json(usuarios);
    } catch (error) {
      console.error("Error al consultar personal:", error);

      res.status(500).json({
        mensaje: "No se pudo consultar el personal.",
      });
    }
  }
);

router.patch(
  "/personal/:id/estado",
  verificarToken,
  permitirRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({
          mensaje: "El identificador del usuario no es válido.",
        });
        return;
      }

      if (estado !== 0 && estado !== 1) {
        res.status(400).json({
          mensaje: "El estado debe ser 0 (inactivo) o 1 (activo).",
        });
        return;
      }

      if (estado === 0 && Number(req.usuario?.sub) === id) {
        res.status(400).json({
          mensaje: "No puedes desactivar tu propia cuenta.",
        });
        return;
      }

      const [filas] = await pool.execute<Usuario[]>(
        `SELECT id, rol, estado
         FROM usuarios
         WHERE id = ?
           AND rol IN ('ADMIN', 'EMPLEADO')
         LIMIT 1`,
        [id]
      );

      const usuario = filas[0];

      if (!usuario) {
        res.status(404).json({
          mensaje: "No se encontró esa cuenta de personal.",
        });
        return;
      }

      if (
        estado === 0 &&
        usuario.rol === "ADMIN" &&
        Number(usuario.estado) === 1
      ) {
        const [administradores] = await pool.execute<Usuario[]>(
          `SELECT id
           FROM usuarios
           WHERE rol = 'ADMIN'
             AND estado = 1`
        );

        if (administradores.length <= 1) {
          res.status(400).json({
            mensaje:
              "No puedes desactivar al último administrador activo.",
          });
          return;
        }
      }

      await pool.execute(
        `UPDATE usuarios
         SET estado = ?
         WHERE id = ?
           AND rol IN ('ADMIN', 'EMPLEADO')`,
        [estado, id]
      );

      res.json({
        mensaje:
          estado === 1
            ? "Cuenta activada correctamente."
            : "Cuenta desactivada correctamente.",
        id,
        estado,
      });
    } catch (error) {
      console.error(
        "Error al cambiar el estado del personal:",
        error
      );

      res.status(500).json({
        mensaje: "No se pudo actualizar el estado de la cuenta.",
      });
    }
  }
);

router.get(
  "/clientes",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (_req, res) => {
    try {
      const [clientes] = await pool.execute<Usuario[]>(
        `SELECT id, nombre, correo, rol, estado
         FROM usuarios
         WHERE rol = 'CLIENTE'
         ORDER BY nombre ASC`
      );

      res.json(clientes);
    } catch (error) {
      console.error("Error al consultar clientes:", error);

      res.status(500).json({
        mensaje: "No se pudieron consultar los clientes.",
      });
    }
  }
);

router.post(
  "/crear-cliente",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (req, res) => {
    try {
      const { nombre, correo, contrasena } = req.body;

      if (
        typeof nombre !== "string" ||
        typeof correo !== "string" ||
        typeof contrasena !== "string" ||
        !nombre.trim() ||
        !correo.trim() ||
        !contrasena
      ) {
        res.status(400).json({
          mensaje: "Completa el nombre, correo y contraseña.",
        });
        return;
      }

      const nombreLimpio = nombre.trim();
      const correoLimpio = correo.trim().toLowerCase();

      if (
        nombreLimpio.length > 150 ||
        correoLimpio.length > 150
      ) {
        res.status(400).json({
          mensaje: "El nombre o el correo son demasiado largos.",
        });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
        res.status(400).json({
          mensaje: "Introduce un correo electrónico válido.",
        });
        return;
      }

      if (
        contrasena.length < 8 ||
        Buffer.byteLength(contrasena, "utf8") > 72
      ) {
        res.status(400).json({
          mensaje:
            "La contraseña debe tener al menos 8 caracteres y un máximo de 72 bytes.",
        });
        return;
      }

      const [existentes] = await pool.execute<Usuario[]>(
        "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
        [correoLimpio]
      );

      if (existentes.length > 0) {
        res.status(409).json({
          mensaje: "Ya existe una cuenta con ese correo.",
        });
        return;
      }

      const hash = await bcrypt.hash(contrasena, 12);

      const [resultado] = await pool.execute<ResultSetHeader>(
        `INSERT INTO usuarios
          (nombre, correo, contrasena, rol, estado)
         VALUES (?, ?, ?, 'CLIENTE', 1)`,
        [nombreLimpio, correoLimpio, hash]
      );

      res.status(201).json({
        mensaje: "Cliente registrado correctamente.",
        cliente: {
          id: resultado.insertId,
          nombre: nombreLimpio,
          correo: correoLimpio,
          rol: "CLIENTE",
          estado: 1,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ER_DUP_ENTRY"
      ) {
        res.status(409).json({
          mensaje: "Ya existe una cuenta con ese correo.",
        });
        return;
      }

      console.error("Error al registrar cliente:", error);

      res.status(500).json({
        mensaje: "No se pudo registrar el cliente.",
      });
    }
  }
);

/*
  ACTIVAR O DESACTIVAR CLIENTES
*/

router.patch(
  "/clientes/:id/estado",
  verificarToken,
  permitirRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({
          mensaje: "El identificador del cliente no es válido.",
        });
        return;
      }

      if (estado !== 0 && estado !== 1) {
        res.status(400).json({
          mensaje: "El estado debe ser 0 (inactivo) o 1 (activo).",
        });
        return;
      }

      const [filas] = await pool.execute<Usuario[]>(
        `SELECT id, nombre, correo, rol, estado
         FROM usuarios
         WHERE id = ?
           AND rol = 'CLIENTE'
         LIMIT 1`,
        [id]
      );

      const cliente = filas[0];

      if (!cliente) {
        res.status(404).json({
          mensaje: "No se encontró esa cuenta de cliente.",
        });
        return;
      }

      await pool.execute(
        `UPDATE usuarios
         SET estado = ?
         WHERE id = ?
           AND rol = 'CLIENTE'`,
        [estado, id]
      );

      res.json({
        mensaje:
          estado === 1
            ? "Cuenta del cliente activada correctamente."
            : "Cuenta del cliente desactivada correctamente.",
        id,
        estado,
      });
    } catch (error) {
      console.error(
        "Error al cambiar el estado del cliente:",
        error
      );

      res.status(500).json({
        mensaje: "No se pudo actualizar el estado del cliente.",
      });
    }
  }
);

router.put(
"/clientes/:id",
verificarToken,
permitirRoles("ADMIN", "EMPLEADO"),
async (req, res) => {
try {
const id = Number(req.params.id);
const { nombre, correo } = req.body;

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      mensaje: "El identificador del cliente no es válido.",
    });
    return;
  }

  if (
    typeof nombre !== "string" ||
    typeof correo !== "string" ||
    !nombre.trim() ||
    !correo.trim()
  ) {
    res.status(400).json({
      mensaje: "Completa el nombre y el correo del cliente.",
    });
    return;
  }

  const nombreLimpio = nombre.trim();
  const correoLimpio = correo.trim().toLowerCase();

  if (nombreLimpio.length > 150 || correoLimpio.length > 150) {
    res.status(400).json({
      mensaje: "El nombre o el correo son demasiado largos.",
    });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
    res.status(400).json({
      mensaje: "Introduce un correo electrónico válido.",
    });
    return;
  }

  const [clientes] = await pool.execute<Usuario[]>(
    `SELECT id
     FROM usuarios
     WHERE id = ? AND rol = 'CLIENTE'
     LIMIT 1`,
    [id]
  );

  if (clientes.length === 0) {
    res.status(404).json({
      mensaje: "No se encontró el cliente.",
    });
    return;
  }

  const [correosExistentes] = await pool.execute<Usuario[]>(
    `SELECT id
     FROM usuarios
     WHERE correo = ? AND id <> ?
     LIMIT 1`,
    [correoLimpio, id]
  );

  if (correosExistentes.length > 0) {
    res.status(409).json({
      mensaje: "Ya existe una cuenta con ese correo.",
    });
    return;
  }

  await pool.execute<ResultSetHeader>(
    `UPDATE usuarios
     SET nombre = ?, correo = ?
     WHERE id = ? AND rol = 'CLIENTE'`,
    [nombreLimpio, correoLimpio, id]
  );

  res.json({
    mensaje: "Cliente actualizado correctamente.",
    cliente: {
      id,
      nombre: nombreLimpio,
      correo: correoLimpio,
    },
  });
} catch (error) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  ) {
    res.status(409).json({
      mensaje: "Ya existe una cuenta con ese correo.",
    });
    return;
  }

  console.error("Error al modificar cliente:", error);

  res.status(500).json({
    mensaje: "No se pudo modificar el cliente.",
  });
}

}
);
export default router;