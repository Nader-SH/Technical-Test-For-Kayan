import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  UUIDV4,
} from 'sequelize';
import sequelize from '../config/db';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface AppointmentAttributes {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: AppointmentStatus;
  scheduled_time: Date;
  started_at?: Date | null;
  finished_at?: Date | null;
  total_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

class Appointment extends Model<
  InferAttributes<Appointment>,
  InferCreationAttributes<Appointment>
> {
  declare id: CreationOptional<string>;
  declare patient_id: string;
  declare doctor_id: string;
  declare status: AppointmentStatus;
  declare scheduled_time: Date;
  declare started_at: CreationOptional<Date | null>;
  declare finished_at: CreationOptional<Date | null>;
  declare total_amount: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    scheduled_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Appointment;

