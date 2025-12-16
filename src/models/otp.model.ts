import { Model, DataTypes, Sequelize } from 'sequelize'

class Otp extends Model {
  public id!: number
  public userId!: number
  public otpHash!: string
  public expiresAt!: Date
  public attempts!: number
  public verified!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static associate(models: any) {
    Otp.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })
  }

  static initModel(sequelize: Sequelize) {
    Otp.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        otpHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        attempts: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'otps',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['otpHash'] },
          { fields: ['expiresAt'] },
        ],
      }
    )

    return Otp
  }
}

export default Otp
