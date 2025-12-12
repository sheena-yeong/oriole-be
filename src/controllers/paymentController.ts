import { Request, Response } from 'express';
import Stripe from 'stripe';

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
