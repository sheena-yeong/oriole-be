import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from 'morgan';
import { verifyToken } from './middleware/verifyToken';
import dotenv from 'dotenv';
import { connectDB } from './db/db';
import authRouter from './routers/authRoutes';
import cryptoRouter from './routers/cryptoRoutes';
import { connectRedis, disconnectRedis } from './utils/redis';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(
  cors({
    origin: ['http://localhost:5173'],
  })
);
app.use(express.json());
app.use(logger('dev'));

app.use('/auth', authRouter);
app.use('/coins', verifyToken, cryptoRouter);

async function startServer() {
  try {
    await connectRedis();
    console.log('Redis connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
})

startServer();