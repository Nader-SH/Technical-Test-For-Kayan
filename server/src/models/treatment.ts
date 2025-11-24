import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  UUIDV4,
} from 'sequelize';
import sequelize from '../config/db';

export interface TreatmentAttributes {
  id: string;
  appointment_id: string;
  name: string;
  cost: number;
  created_at?: Date;
}

class Treatment extends Model<
  InferAttributes<Treatment>,
  InferCreationAttributes<Treatment>
> {
  declare id: CreationOptional<string>;
  declare appointment_id: string;
  declare name: string;
  declare cost: number;
  declare created_at: CreationOptional<Date>;
}

Treatment.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'treatments',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Treatment;

