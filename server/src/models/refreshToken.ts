import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  UUIDV4,
} from 'sequelize';
import sequelize from '../config/db';

export interface RefreshTokenAttributes {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at?: Date;
}

class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<string>;
  declare user_id: string;
  declare token: string;
  declare expires_at: Date;
  declare created_at: CreationOptional<Date>;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default RefreshToken;

