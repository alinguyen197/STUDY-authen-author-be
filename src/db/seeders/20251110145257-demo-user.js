'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        email: 'khoana15@fpt.com',
        password: '123123',
        otpEnabled: true,
        otpVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
       {
        name: 'Ali Nguyen',
        email: 'alinguyen@gmail.com',
        password: '123123',
        otpEnabled: true,
        otpVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {})
  },
}
