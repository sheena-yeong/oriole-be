import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from 'morgan'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

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
