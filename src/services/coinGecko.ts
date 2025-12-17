import axios from 'axios';
import type { CoinMarket } from '../types/coins';

export interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
}

export async function fetchCoins() {
  try {
    const res = await axios.get<CoinGeckoData[]>(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
        },
      }
    );

    return res.data.map((coin) => ({
      id: coin.id,
      rank: coin.market_cap_rank,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      image: coin.image,
    }));
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.log('Rate Limit reached, try again later.');
    }
    console.error(err);
    throw new Error('Failed to fetch crypto data');
  }
}

export const fetchMarketChart = async (id: string, days: number = 7) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days,
        },
      }
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.log('Rate Limit reached, try again later.');
    }
    console.error(err);
    throw new Error('Failed to fetch market chart data');
  }
};

export const fetchTrendingSearches = async () => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search/trending`
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.log('Rate Limit reached, try again later.');
    }
    console.error(err);
    throw new Error('Failed to fetch trending searches');
  }
};

export const fetchTopGainers = async () => {
  try {
    const response = await axios.get<CoinMarket[]>(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          price_change_percentage: '24h',
        },
      }
    );

    const topGainers = response.data
      .sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? 0) -
          (a.price_change_percentage_24h ?? 0)
      )
      .slice(0, 3);

    return topGainers;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.log('Rate Limit reached, try again later.');
    }
    console.error(err);
    throw new Error('Failed to fetch top gainers.');
  }
};

export const fetchTopLosers = async () => {
  try {
    const response = await axios.get<CoinMarket[]>(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          price_change_percentage: '24h',
        },
      }
    );

    const topLosers = response.data
      .sort(
        (a, b) =>
          (a.price_change_percentage_24h ?? 0) -
          (b.price_change_percentage_24h ?? 0)
      )
      .slice(0, 3);

    return topLosers;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.log('Rate Limit reached, try again later.');
    }
    console.error(err);
    throw new Error('Failed to fetch top losers.');
  }
};
