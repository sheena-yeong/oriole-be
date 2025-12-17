import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { initUserModel } from '../models/User';
import { initWatchlistModel } from '../models/WatchList';
import { initUserCoinsModel } from '../models/UserCoins';

dotenv.config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME!,
      process.env.DB_USER!,
      process.env.DB_PASSWORD!,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    initUserModel(sequelize);
    initWatchlistModel(sequelize);
    initUserCoinsModel(sequelize);
    await sequelize.sync({ alter: true });
    console.log('Database connected');
  } catch (error) {
    console.error('Unable to connect:', error);
  }
};

export { sequelize, connectDB };
