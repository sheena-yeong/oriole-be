import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthPayload extends JwtPayload {
  id: number;
  email: string;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const secret = process.env.ACCESS_SECRET;
  if (!secret) {
    return res.status(500).json({ err: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    res.status(401).json({ err: 'Not authorized.' });
  }
};
