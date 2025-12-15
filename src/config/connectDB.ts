import db from '../models'
export const connectDB = async () => {
  try {
    await db.sequelize.authenticate() // Kiểm tra kết nối
    console.log('✅ Database connected!')

    // Tự động tạo bảng nếu chưa có
    // await sequelize.sync({ alter: true });
    // hoặc { force: true } để xoá & tạo lại toàn bộ bảng (cẩn thận khi dùng)
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
  }
}
