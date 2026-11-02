
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../confit/database";
import type { RowDataPacket } from "mysql2";

export interface DatosToken {
  sub: string;
  rol: "ADMIN" | "EMPLEADO" | "CLIENTE";
}

interface UsuarioActual extends RowDataPacket {
  id: number;
  rol: DatosToken["rol"];
  estado: number;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: DatosToken;
    }
  }
}

export async function verificarToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith("Bearer ")) {
    res.status(401).json({
      mensaje: "Debes iniciar sesión para realizar esta acción.",
    });
    return;
  }

  const token = encabezado.slice(7);

  try {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
      res.status(500).json({
        mensaje: "La autenticación no está configurada correctamente.",
      });
      return;
    }

    const decodificado = jwt.verify(token, secreto);

    if (
      typeof decodificado === "string" ||
      !decodificado.sub ||
      !/^\d+$/.test(String(decodificado.sub)) ||
      !["ADMIN", "EMPLEADO", "CLIENTE"].includes(
        String(decodificado.rol)
      )
    ) {
      res.status(401).json({
        mensaje: "Token inválido.",
      });
      return;
    }

    const [usuarios] = await pool.execute<UsuarioActual[]>(
      `SELECT id, rol, estado
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [decodificado.sub]
    );

    const usuario = usuarios[0];

    if (!usuario || Number(usuario.estado) !== 1) {
      res.status(401).json({
        mensaje: "Tu cuenta está desactivada o ya no existe. Inicia sesión nuevamente.",
      });
      return;
    }

    req.usuario = {
      sub: String(usuario.id),
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        mensaje: "La sesión es inválida o ha expirado. Inicia sesión nuevamente.",
      });
      return;
    }

    console.error("Error al verificar la cuenta:", error);

    res.status(500).json({
      mensaje: "No se pudo verificar el estado de tu cuenta.",
    });
  }
}

export function permitirRoles(
  ...rolesPermitidos: DatosToken["rol"][]
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.usuario) {
      res.status(401).json({
        mensaje: "Debes iniciar sesión.",
      });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({
        mensaje: "No tienes permisos para realizar esta acción.",
      });
      return;
    }

    next();
  };
}
