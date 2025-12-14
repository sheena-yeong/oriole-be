import { Request, Response } from 'express';

export async function addUserCoin(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // deduct from user's wallet. If insufficient funds, return error message.

    // find if theres existing coin in usercoin. If yes, add the quantity together. if no, create new row and add quantity

  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to add user coin.',
    });
  }
}
