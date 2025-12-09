import axios from 'axios';

interface fgIndex {
  timestamp: string;
  actual_value: number;
  previous_value: number;
  bitcoin_price_usd: number;
  previous_bitcoin_price_usd: number;
}

export async function fetchFearGreedLatest(): Promise<fgIndex> {
  try {
    const res = await axios.get('https://api.coinybubble.com/v1/latest');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch Fear & Greed index', err);
    throw err;
  }
}
