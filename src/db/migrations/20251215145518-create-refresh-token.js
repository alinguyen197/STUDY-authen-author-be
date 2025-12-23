module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tokenHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      deviceInfo: {
        type: Sequelize.STRING,
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
        allowNull: false,
        defaultValue: false,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      replacedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('refresh_tokens', ['userId'])
    await queryInterface.addIndex('refresh_tokens', ['tokenHash'])
    await queryInterface.addIndex('refresh_tokens', ['expiresAt'])
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('refresh_tokens')
  },
}
