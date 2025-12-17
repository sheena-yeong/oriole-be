import cors from 'cors';
import dotenv from 'dotenv';
import logger from 'morgan';
import express from 'express';
import { verifyToken } from './middleware/verifyToken';
import { connectDB } from './db/db';
import { connectRedis, disconnectRedis } from './utils/redis';
import authRouter from './routers/authRoutes';
import cryptoDataRouter from './routers/cryptoDataRoutes';
import paymentRouter from './routers/paymentRoutes';
import { handleWebhook } from './controllers/paymentController';
import portfolioRouter from './routers/portfolioRoutes';
import walletRouter from './routers/walletRoutes';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://oriole.up.railway.app'],
    credentials: true
  })
);

app.post(
  '/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

app.use(express.json());
app.use(logger('dev'));

app.use('/auth', authRouter);
app.use('/coins', verifyToken, cryptoDataRouter);
app.use('/payment', verifyToken, paymentRouter);
app.use('/wallet', verifyToken, walletRouter);
app.use('/portfolio', verifyToken, portfolioRouter);

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
});

startServer();
