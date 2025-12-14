import { Request, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { UserCoins } from '../models/UserCoins';
import { sequelize } from '../db/db';
import { Transaction } from 'sequelize';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd', metadata } = req.body;

    if (!amount || amount == 0) {
      return res
        .status(400)
        .json({ error: 'Invalid amount. Must be greater than 0.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        userId: req.user?.id,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Error creating payment intent', err);
    res.status(500).json({
      error:
        err instanceof Error ? err.message : 'Failed to create payment intent',
    });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Payment intent ID is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error('Error confirming payment', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to confirm payment',
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Webhook error',
    });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { coinSymbol, coinAmount, coinId } = paymentIntent.metadata;
      console.log('Payment succeeded', paymentIntent.id);
      console.log(`Credit ${coinAmount} ${coinSymbol} to user`);

      // send nodemailer
      // await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');

      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed', failedPayment.id);
      // send nodemailer
      // await updateOrderStatus(payment.Intent.metadata.orderId. 'failed');

      break;
  }
};

export async function purchaseCrypto(req: Request, res: Response) {
  const t: Transaction = await sequelize.transaction();

  try {
    const { userId, coinSymbol, quantity, buyPrice, totalCost } = req.body;

    if (!userId || !coinSymbol || !quantity || !buyPrice || !totalCost) {
      await t.rollback();
      return res.status(400).json({
        error:
          'Missing required fields: userId, coinSymbol, quantity, buyPrice.',
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
        coinSymbol: coinSymbol,
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
      userCoin = await UserCoins.create({
        userId: userId,
        coinSymbol: coinSymbol,
        quantity: quantityNum,
        buyPrice: buyPriceNum,
      },
    {
      transaction: t
    })
    }

    await t.commit();

    return res.status(200).json({
      mesage: 'Crypto purchased successfully',
      coin: {
        symbol: userCoin.coinSymbol,
        quantity: userCoin.quantity,
      },
      newWalletBalance: user.walletBalance
    })
  } catch (err) {
    await t.rollback();
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to add user coin.',
    });
  }
}