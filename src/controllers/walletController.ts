import { Request, Response } from 'express';
import { User } from '../models/User';
import { UserCoins } from '../models/UserCoins';
import { sequelize } from '../db/db';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

export async function purchaseCrypto(req: Request, res: Response) {
  const t: Transaction = await sequelize.transaction();

  try {
    const userId = req.user?.id;
    if (!userId) {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    }
    const { coinId, quantity, buyPrice, totalCost } = req.body;

    if (!coinId || !quantity || !buyPrice || !totalCost) {
      await t.rollback();
      return res.status(400).json({
        error: 'Missing required fields: coinId, quantity, buyPrice.',
      });
    }

    const quantityNum = parseFloat(quantity);
    const buyPriceNum = parseFloat(buyPrice);
    const totalCostNum = parseFloat(totalCost);

    if (quantityNum <= 0 || buyPriceNum <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid quantity or price' });
    }

    const user = await User.findByPk(userId, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = parseFloat(user.walletBalance.toString());

    if (currentBalance < totalCostNum) {
      await t.rollback();
      return res.status(400).json({
        error: 'Insufficient wallet balance',
        required: totalCostNum,
        available: currentBalance,
      });
    }

    user.walletBalance = currentBalance - totalCostNum;
    await user.save({ transaction: t });

    const existingCoin = await UserCoins.findOne({
      where: {
        userId: userId,
        coinId: coinId,
      },
      transaction: t,
    });

    let userCoin;

    if (existingCoin) {
      const existingQuantity = parseFloat(existingCoin.quantity.toString());
      const existingBuyPrice = parseFloat(existingCoin.buyPrice.toString());

      const totalQuantity = existingQuantity + quantityNum;
      const totalValue =
        existingQuantity * existingBuyPrice + quantityNum * buyPriceNum;
      const newAverageBuyPrice = totalValue / totalQuantity;

      existingCoin.quantity = totalQuantity;
      existingCoin.buyPrice = newAverageBuyPrice;
      await existingCoin.save({ transaction: t });

      userCoin = existingCoin;
    } else {
      userCoin = await UserCoins.create(
        {
          userId: userId,
          coinId: coinId,
          quantity: quantityNum,
          buyPrice: buyPriceNum,
        },
        {
          transaction: t,
        }
      );
    }

    await t.commit();

    return res.status(200).json({
      mesage: 'Crypto purchased successfully',
      coin: {
        symbol: userCoin.coinId,
        quantity: userCoin.quantity,
      },
      newWalletBalance: user.walletBalance,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to add user coin.',
    });
  }
}
