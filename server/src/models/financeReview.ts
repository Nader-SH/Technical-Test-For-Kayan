import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  UUIDV4,
} from 'sequelize';
import sequelize from '../config/db';

export interface FinanceReviewAttributes {
  id: string;
  appointment_id: string;
  finance_user_id: string;
  approved: boolean;
  notes?: string | null;
  created_at?: Date;
}

class FinanceReview extends Model<
  InferAttributes<FinanceReview>,
  InferCreationAttributes<FinanceReview>
> {
  declare id: CreationOptional<string>;
  declare appointment_id: string;
  declare finance_user_id: string;
  declare approved: boolean;
  declare notes: CreationOptional<string | null>;
  declare created_at: CreationOptional<Date>;
}

FinanceReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'id',
      },
    },
    finance_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'finance_reviews',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default FinanceReview;

