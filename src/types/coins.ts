export interface CoinData {
  id: string,
  rank: number;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  change24h: number;
}

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}