import { Request, Response, NextFunction } from 'express';

export function ensureAuth(req: Request, res: Response, next: NextFunction) {

  // If you prefer JWT, this middleware would instead validate the Authorization header.
  if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}