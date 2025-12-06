import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { initUserModel } from '../models/User';
import { initCoinModel } from '../models/Coin';

dotenv.config();

const sequelize = new Sequelize(
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
    initCoinModel(sequelize);
    await sequelize.sync({ alter: true });
    console.log('Database connected');
  } catch (error) {
    console.error('Unable to connect:', error);
  }
};

export { sequelize, connectDB };
