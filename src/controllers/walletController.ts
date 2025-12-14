import { Request, Response } from 'express';
import { User } from '../models/User';

export async function getWalletBalance(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      balance: user.walletBalance,
    });
  } catch (err) {
    console.error('Error getting wallet balance:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to get balance',
    });
  }
}

export async function topUpWallet(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { amount } = req.body;
    const topUpAmount = parseFloat(amount);

    if (!topUpAmount || topUpAmount <= 0) {
      return res.status(400).json({ error: 'Invalid top-up amount.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.walletBalance =
      parseFloat(user.walletBalance.toString()) + topUpAmount;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Wallet topped up successfully.',
      newBalance: user.walletBalance,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to add user coin.',
    });
  }
}


