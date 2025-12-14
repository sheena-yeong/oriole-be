import { DataTypes, Model, Sequelize } from 'sequelize';

export class WatchList extends Model {
  public coinId!: string;
  public symbol!: string;
}

export const initWatchlistModel = (sequelize: Sequelize): typeof WatchList => {
  WatchList.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      coinId: {
        type: DataTypes.STRING,
        allowNull: false,
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