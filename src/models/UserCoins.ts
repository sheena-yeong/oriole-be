import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface UserCoinAttributes {
  id: number;
  userId: number;
  coinSymbol: string;
  quantity: number;
  buyPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCoinCreationAttributes
  extends Optional<UserCoinAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserCoins
  extends Model<UserCoinAttributes, UserCoinCreationAttributes>
  implements UserCoinAttributes
{
  public id!: number;
  public userId!: number;
  public coinSymbol!: string;
  public quantity!: number;
  public buyPrice!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initUserCoinsModel = (sequelize: Sequelize): typeof UserCoins => {
  UserCoins.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE', // if user is deleted, delete all coins too
      },
      coinSymbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
      },
      buyPrice: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'userCoins',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'coinSymbol'],
        },
      ],
    }
  );
  return UserCoins;
};

export { UserCoins, UserCoinCreationAttributes };
