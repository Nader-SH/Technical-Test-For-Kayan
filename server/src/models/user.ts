import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  UUIDV4,
} from 'sequelize';
import sequelize from '../config/db';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  FINANCE = 'finance',
}

export interface UserAttributes {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare full_name: string;
  declare email: string;
  declare password_hash: string;
  declare role: UserRole;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('patient', 'doctor', 'finance'),
      allowNull: false,
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default User;

