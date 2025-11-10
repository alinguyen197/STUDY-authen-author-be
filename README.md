https://sequelize.org/docs/v6/other-topics/migrations/

# Setup cài sequelize và cấu hình database

👉 1. Cài đặt các thư viện: sequlize-cli, sequelize và mysql2
npm install --save-dev sequelize-cli@6.2.0
npm install --save mysql2@2.2.5
npm install --save sequelize@6.6.2

👉 2. Thêm file .sequelizerc tại thư mục root
Nội dung file .sequelizerc
const path = require('path');
module.exports = {
'config': path.resolve('./src/config', 'config.json'),
'migrations-path': path.resolve('./src', 'migrations'),
'models-path': path.resolve('./src', 'models'),
'seeders-path': path.resolve('./src', 'seeders')
}

👉 Tại thư mục root, sử dụng câu lệnh: node_modules/.bin/sequelize init
=> npx sequelize-cli init

👉 3. Tạo model - tương đương tạo table:

<pre><code>
// khi tạo model sẽ sinh ra file migrate
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
</code></pre>

<pre><code>
// tạo ra file thủ công
npx sequelize-cli migration:generate --name add-isactive-to-user 
</code></pre>

👉 4: Tạo migrations: để tự động map table vào database
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo

👉5. Tạo Seeder (tạo data) : npx sequelize-cli seed:generate --name demo-user

- Run các seeder : npx sequelize-cli db:seed:all
- Undo : npx sequelize-cli db:seed:undo:all

👉6. tạo file connectDB.js để dùng sequelize để kết nối DB (https://sequelize.org/docs/v6/getting-started/#connecting-to-a-database)

husky
npx husky install
npx husky add .husky/pre-commit "npm run lint"

echo "🔍 Running type check..."
npx tsc --noEmit

echo "🎨 Running prettier and lint..."
npx lint-staged
