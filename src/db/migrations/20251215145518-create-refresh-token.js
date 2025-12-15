'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tokenHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      deviceInfo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      replacedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'refresh_tokens',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })

    await queryInterface.addIndex('refresh_tokens', ['userId'])
    await queryInterface.addIndex('refresh_tokens', ['tokenHash'])
    await queryInterface.addIndex('refresh_tokens', ['expiresAt'])
    await queryInterface.addIndex('refresh_tokens', ['revoked'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens')
  },
}
