const host = process.env.DB_HOST
const username = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME
const port = process.env.DB_PORT

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'postgres',
    logging: false,
  },
}
