import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as getId } from 'uuid';
import { User } from '../models/User';
import { Request, Response } from 'express';

interface SignUpRequestBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const signUp = async (
  req: Request<{}, {}, SignUpRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ error: 'Email, Password, First and Last Name are required.' });
    }

    const userInDatabase = await User.findOne({
      where: { email },
    });
    if (userInDatabase) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }

    await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    return res
      .status(200)
      .json({ message: 'Sign Up successful, please proceed to log in.' });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: (err as any).errors?.map((e: any) => e.message),
        });
      }

      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'This email is already in use.',
        });
      }

      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
