import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const tokenBlacklist = new Set<string>();

export const checkRole = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    const token = authHeader.split(' ')[1];

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Sesión inválida. Inicie sesión nuevamente.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        username: string;
        role: string;
      };

      if (!rolesPermitidos.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden. No tienes los permisos requeridos.' });
      }

      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
  };
};
