import express, { Application } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import initWebRoutes from './routes';
import cors from 'cors';

dotenv.config();
const app: Application = express();
app.use(cors({ origin: true, credentials: true })); // Cấu hình CORS
app.use(express.json());

initWebRoutes(app); // Khởi tạo các route từ src/routes/index.ts

connectDB(); // Kết nối đến database

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
