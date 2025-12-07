import { DataTypes, Model, Sequelize } from 'sequelize';

export class WatchList extends Model {
  public id!: number;
  public symbol!: string;
}

export const initCoinModel = (sequelize: Sequelize): typeof WatchList => {
  WatchList.init(
    {
      userId: {
        type: DataTypes.INTEGER,
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
      tableName: 'watchlist',
      timestamps: true,
    }
  );

  return WatchList;
};