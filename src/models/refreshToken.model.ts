import { Model, DataTypes, Sequelize } from 'sequelize'
import User from './user.model'

class RefreshToken extends Model {
  public id!: number
  public userId!: number
  public tokenHash!: string
  public deviceInfo!: string | null
  public ipAddress!: string | null
  public expiresAt!: Date
  public revoked!: boolean
  public revokedAt!: Date | null
  public replacedBy!: number | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static associate(models: any) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })

    RefreshToken.belongsTo(RefreshToken, {
      foreignKey: 'replacedBy',
      as: 'replacement',
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
        },
        tokenHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        deviceInfo: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        ipAddress: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        revokedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        replacedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'RefreshTokens',
        tableName: 'refresh_tokens',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['tokenHash'], unique: true },
          { fields: ['expiresAt'] },
          { fields: ['revoked'] },
        ],
      }
    )

    return RefreshToken
  }
}

export default RefreshToken
