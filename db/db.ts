import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { initUserModel } from '../models/User';

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

initUserModel(sequelize);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (error) {
    console.error('Unable to connect:', error);
  }
};

export { sequelize, connectDB };
