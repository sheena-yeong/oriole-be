import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ err: 'No token provided ' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const secret = process.env.ACCESS_SECRET;
    if (!secret) {
      return res.status(500).json({ err: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ err: 'Not authorized.' });
  }
};

export default verifyToken;
