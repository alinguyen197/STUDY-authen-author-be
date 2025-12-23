module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('otp_codes', {
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
      code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      codeHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      purpose: {
        type: Sequelize.ENUM('login', 'enable_2fa', 'disable_2fa'),
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('otp_codes', ['userId', 'purpose'])
    await queryInterface.addIndex('otp_codes', ['codeHash'])
    await queryInterface.addIndex('otp_codes', ['expiresAt'])
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('otp_codes')
  },
}
