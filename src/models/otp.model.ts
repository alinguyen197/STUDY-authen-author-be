import { Model, DataTypes, Sequelize } from 'sequelize'

class OTPCode extends Model {
  public id!: number
  public userId!: number
  public code!: string // Mã OTP (6 chữ số)
  public codeHash!: string // Hash của OTP (bảo mật)
  public purpose!: 'login' | 'enable_2fa' | 'disable_2fa' // Mục đích sử dụng
  public expiresAt!: Date
  public verified!: boolean
  public verifiedAt!: Date | null
  public attempts!: number // Số lần thử sai (chống brute-force)
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static associate(models: any) {
    OTPCode.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })
  }

  static initModel(sequelize: Sequelize) {
    OTPCode.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        code: {
          type: DataTypes.STRING(6),
          allowNull: false,
        },
        codeHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        purpose: {
          type: DataTypes.ENUM('login', 'enable_2fa', 'disable_2fa'),
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        verifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        attempts: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'OTPCode',
        tableName: 'otp_codes',
        timestamps: true,
        indexes: [
          { fields: ['userId', 'purpose'] },
          { fields: ['codeHash'] },
          { fields: ['expiresAt'] },
        ],
      }
    )

    return OTPCode
  }
}

export default OTPCode
