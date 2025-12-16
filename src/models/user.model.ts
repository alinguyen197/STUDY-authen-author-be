import { Model, DataTypes, Sequelize } from 'sequelize'

// Kế thừa Model
class User extends Model {
  // !: = Non-null Assertion Operator
  // Nói với TypeScript rằng:
  // “Biến này chắc chắn sẽ có giá trị vào runtime,
  // đừng cảnh báo ‘possibly undefined’ nữa.”
  public id!: number
  public name!: string
  public email!: string
  public password!: string
  // timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static associate(models: any) {
    User.hasMany(models.RefreshToken, {
      foreignKey: 'userId',
      as: 'refreshTokens',
    })
  }

  static initModel(sequelize: Sequelize) {
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
    )

    return User
  }
}

export default User
