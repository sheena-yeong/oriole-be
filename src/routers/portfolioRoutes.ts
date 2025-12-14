import express from 'express';
const router = express.Router();
import { getUserPortfolio } from '../controllers/portfolioController';

router.get('/', getUserPortfolio);

export default router;
