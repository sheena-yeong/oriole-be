import { DataTypes, Model, Sequelize } from 'sequelize';

export class Coin extends Model {
  public id!: number;
  public name!: string;
  public symbol!: string;
}

export const initCoinModel = (sequelize: Sequelize): typeof Coin => {
  Coin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
    },
    {
      sequelize,
      tableName: 'coins',
      timestamps: true,
    }
  );

  return Coin;
};