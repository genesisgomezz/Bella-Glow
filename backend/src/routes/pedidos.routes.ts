
import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../confit/database";
import {
  verificarToken,
  permitirRoles,
} from "../middlewares/auth.middleware";

const router = Router();

interface ProductoPedido extends RowDataPacket {
  id: number;
  precio: number | string;
  stock: number;
  estado: number;
}

interface Pedido extends RowDataPacket {
  id: number;
  usuario_id: number;
  fecha: Date;
  total: number | string;
  estado: string;
}

// REGISTRAR PEDIDO: cliente autenticado
router.post(
  "/",
  verificarToken,
  permitirRoles("CLIENTE"),
  async (req, res) => {
    const usuarioId = Number(req.usuario?.sub);
    const { productos } = req.body as {
      productos?: { producto_id: number; cantidad: number }[];
    };

    if (!Array.isArray(productos) || productos.length === 0) {
      res.status(400).json({
        mensaje: "El pedido debe incluir al menos un producto.",
      });
      return;
    }

    const cantidades = new Map<number, number>();

    for (const item of productos) {
      if (
        !Number.isSafeInteger(item?.producto_id) ||
        item.producto_id <= 0 ||
        !Number.isSafeInteger(item?.cantidad) ||
        item.cantidad <= 0
      ) {
        res.status(400).json({
          mensaje: "Cada producto debe tener un identificador y una cantidad válidos.",
        });
        return;
      }

      if (cantidades.has(item.producto_id)) {
        res.status(400).json({
          mensaje: "No envíes el mismo producto más de una vez; suma sus cantidades.",
        });
        return;
      }

      cantidades.set(item.producto_id, item.cantidad);
    }

    let conexion;

    try {
      conexion = await pool.getConnection();
      await conexion.beginTransaction();

      let total = 0;
      const detalles: {
        producto_id: number;
        cantidad: number;
        precio: number;
      }[] = [];

      for (const [productoId, cantidad] of cantidades) {
        const [filas] = await conexion.execute<ProductoPedido[]>(
          `SELECT id, precio, stock, estado
           FROM productos
           WHERE id = ?
           FOR UPDATE`,
          [productoId]
        );

        const producto = filas[0];

        if (!producto || Number(producto.estado) !== 1) {
          await conexion.rollback();
          res.status(400).json({
            mensaje: `El producto ${productoId} no existe o no está disponible.`,
          });
          return;
        }

        if (Number(producto.stock) < cantidad) {
          await conexion.rollback();
          res.status(409).json({
            mensaje: `No hay suficiente stock para el producto ${productoId}.`,
          });
          return;
        }

        const precio = Number(producto.precio);

        if (!Number.isFinite(precio) || precio < 0) {
          await conexion.rollback();
          res.status(500).json({
            mensaje: "Se encontró un precio de producto inválido.",
          });
          return;
        }

        detalles.push({ producto_id: productoId, cantidad, precio });
        total += precio * cantidad;
      }

      const [resultado] = await conexion.execute<ResultSetHeader>(
        `INSERT INTO pedidos (usuario_id, fecha, total, estado)
         VALUES (?, NOW(), ?, ?)`,
        [usuarioId, total, "PENDIENTE"]
      );

      const pedidoId = resultado.insertId;

      for (const detalle of detalles) {
        await conexion.execute<ResultSetHeader>(
          `INSERT INTO detalle_pedidos
             (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?)`,
          [
            pedidoId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio,
          ]
        );

        await conexion.execute<ResultSetHeader>(
          `UPDATE productos
           SET stock = stock - ?
           WHERE id = ? AND stock >= ?`,
          [detalle.cantidad, detalle.producto_id, detalle.cantidad]
        );
      }

      await conexion.commit();

      res.status(201).json({
        mensaje: "Pedido registrado correctamente.",
        pedido: {
          id: pedidoId,
          usuario_id: usuarioId,
          total: Number(total.toFixed(2)),
          estado: "PENDIENTE",
          detalles: detalles.map((detalle) => ({
            ...detalle,
            subtotal: Number(
              (detalle.precio * detalle.cantidad).toFixed(2)
            ),
          })),
        },
      });
    } catch (error) {
      if (conexion) {
        await conexion.rollback();
      }

      console.error("Error al registrar pedido:", error);
      res.status(500).json({
        mensaje: "No se pudo registrar el pedido.",
      });
    } finally {
      conexion?.release();
    }
  }
);


/* CONSULTAR TODOS LOS PEDIDOS: solo ADMIN y EMPLEADO */
router.get(
  "/",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (_req, res) => {
    try {
      const [pedidos] = await pool.query<RowDataPacket[]>(
        `SELECT
           p.id,
           p.usuario_id,
           u.nombre AS cliente,
           u.correo AS correo_cliente,
           p.fecha,
           p.total,
           p.estado
         FROM pedidos p
         INNER JOIN usuarios u ON u.id = p.usuario_id
         ORDER BY p.fecha DESC, p.id DESC`
      );

      res.json(pedidos);
    } catch (error) {
      console.error("Error al consultar todos los pedidos:", error);
      res.status(500).json({
        mensaje: "No se pudieron consultar los pedidos.",
      });
    }
  }
);


/* ACTUALIZAR ESTADO DEL PEDIDO: solo ADMIN y EMPLEADO */
router.patch(
  "/:id/estado",
  verificarToken,
  permitirRoles("ADMIN", "EMPLEADO"),
  async (req, res) => {
    try {
      const pedidoId = Number(req.params.id);
      const { estado } = req.body as { estado?: string };

      // Validar identificador
      if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
        res.status(400).json({
          mensaje: "El identificador del pedido no es válido.",
        });
        return;
      }

      // Solo se permite elegir estos estados finales
      if (estado !== "PAGADO" && estado !== "CANCELADO") {
        res.status(400).json({
          mensaje: "El estado debe ser PAGADO o CANCELADO.",
        });
        return;
      }

      // Solo permitir cambios si el pedido está pendiente.
      // El UPDATE condicional evita cambios simultáneos incompatibles.
      const [resultado] = await pool.execute<ResultSetHeader>(
        `UPDATE pedidos
         SET estado = ?
         WHERE id = ?
           AND estado = 'PENDIENTE'`,
        [estado, pedidoId]
      );

      if (resultado.affectedRows === 0) {
        const [pedidos] = await pool.execute<Pedido[]>(
          `SELECT id, estado
           FROM pedidos
           WHERE id = ?
           LIMIT 1`,
          [pedidoId]
        );

        if (pedidos.length === 0) {
          res.status(404).json({
            mensaje: "No se encontró el pedido.",
          });
          return;
        }

        res.status(409).json({
          mensaje: `El pedido ya no está pendiente. Estado actual: ${pedidos[0].estado}.`,
        });
        return;
      }

      res.json({
        mensaje: "Estado del pedido actualizado correctamente.",
        pedido: {
          id: pedidoId,
          estado,
        },
      });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);

      res.status(500).json({
        mensaje: "No se pudo actualizar el estado del pedido.",
      });
    }
  }
);

// CONSULTAR PEDIDOS DEL CLIENTE AUTENTICADO
router.get(
  "/mis-pedidos",
  verificarToken,
  permitirRoles("CLIENTE"),
  async (req, res) => {
    try {
      const usuarioId = Number(req.usuario?.sub);

      const [pedidos] = await pool.execute<Pedido[]>(
        `SELECT id, usuario_id, fecha, total, estado
         FROM pedidos
         WHERE usuario_id = ?
         ORDER BY fecha DESC, id DESC`,
        [usuarioId]
      );

      res.json(pedidos);
    } catch (error) {
      console.error("Error al consultar pedidos:", error);
      res.status(500).json({
        mensaje: "No se pudieron consultar los pedidos.",
      });
    }
  }
);

// CONSULTAR DETALLE: solo el propietario del pedido
router.get(
  "/:id",
  verificarToken,
  permitirRoles("CLIENTE"),
  async (req, res) => {
    try {
      const usuarioId = Number(req.usuario?.sub);
      const pedidoId = Number(req.params.id);

      if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
        res.status(400).json({
          mensaje: "El identificador del pedido no es válido.",
        });
        return;
      }

      const [pedidos] = await pool.execute<Pedido[]>(
        `SELECT id, usuario_id, fecha, total, estado
         FROM pedidos
         WHERE id = ? AND usuario_id = ?
         LIMIT 1`,
        [pedidoId, usuarioId]
      );

      const pedido = pedidos[0];

      if (!pedido) {
        res.status(404).json({
          mensaje: "No se encontró el pedido.",
        });
        return;
      }
      
      const [detalles] = await pool.execute<RowDataPacket[]>(
        `SELECT
        d.producto_id,
        p.nombre AS producto,
        p.imagen AS imagen,
        d.cantidad,
        d.precio_unitario,
        d.cantidad * d.precio_unitario AS subtotal
        FROM detalle_pedidos d
        INNER JOIN productos p ON p.id = d.producto_id
        WHERE d.pedido_id = ?
        ORDER BY d.id`,
        [pedidoId]
    );


      res.json({ pedido, detalles });
    } catch (error) {
      console.error("Error al consultar detalle del pedido:", error);
      res.status(500).json({
        mensaje: "No se pudo consultar el pedido.",
      });
    }
  }
);

export default router;
