import { Model, DataTypes, Sequelize } from 'sequelize'

class RefreshToken extends Model {
  public id!: number
  public userId!: number
  public tokenHash!: string // Hash của refresh token (bảo mật)
  public deviceInfo!: string | null
  public ipAddress!: string | null
  public expiresAt!: Date
  public revoked!: boolean
  public revokedAt!: Date | null
  public replacedBy!: number | null // ID của token thay thế (audit trail)
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static associate(models: any) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })
  }

  static initModel(sequelize: Sequelize) {
    RefreshToken.init(
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
        tokenHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        deviceInfo: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ipAddress: {
          type: DataTypes.STRING(45), // IPv6 support
          allowNull: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        revokedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        replacedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'refresh_tokens',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        modelName: 'RefreshToken',
        tableName: 'refresh_tokens',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['tokenHash'] },
          { fields: ['expiresAt'] },
        ],
      }
    )

    return RefreshToken
  }
}

export default RefreshToken
