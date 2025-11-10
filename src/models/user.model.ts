import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

// 1️⃣ Khai báo interface cho thuộc tính của User
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2️⃣ Khai báo interface cho trường được tạo tự động (ví dụ id, createdAt,...)
export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

// 3️⃣ Kế thừa Model và thêm type
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  // !: = Non-null Assertion Operator
  // Nói với TypeScript rằng:
  // “Biến này chắc chắn sẽ có giá trị vào runtime,
  // đừng cảnh báo ‘possibly undefined’ nữa.”
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4️⃣ Định nghĩa model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize, // kết nối đã khởi tạo
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);
