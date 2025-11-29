import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from 'morgan'
import verifyToken from '../middleware/verifyToken'
import dotenv from 'dotenv';
import { connectDB } from '../db/db'

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
app.use(logger('dev'))

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
