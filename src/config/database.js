/**
 * Kiến trúc Bảo mật Cơ sở dữ liệu Cloud (Đề thi Giữa Kì - Điện toán đám mây)
 * Sinh viên: Lê Phú Đẳng - MSSV: 23IT055
 * 
 * Nguyên tắc đặc quyền tối thiểu (Least Privilege):
 * - readConnection: Kết nối sử dụng tài khoản CHỈ ĐỌC (user_read_23IT055 - quyền 'read' trên DB_23IT055)
 * - writeConnection: Kết nối sử dụng tài khoản GHI (user_write_23IT055 - quyền 'readWrite' trên DB_23IT055)
 */

const mongoose = require('mongoose');

const MONGO_URI_READ = process.env.MONGO_URI_READ || 'mongodb://localhost:27017/DB_23IT055_read';
const MONGO_URI_WRITE = process.env.MONGO_URI_WRITE || 'mongodb://localhost:27017/DB_23IT055_write';

if (!process.env.MONGO_URI_READ || process.env.MONGO_URI_READ.includes('<password>')) {
  console.warn('\n⚠️  [LƯU Ý]: Bạn chưa điền chuỗi kết nối MongoDB Atlas thật vào file .env!');
  console.warn('👉 Hãy mở file .env và thay thế <password> cùng địa chỉ cluster của bạn.\n');
}

// Tạo kết nối riêng biệt cho luồng ĐỌC (Read Stream)
const readConnection = mongoose.createConnection(MONGO_URI_READ, {
  serverSelectionTimeoutMS: 5000,
});

readConnection.on('connected', () => {
  console.log('✅ [Least Privilege - READ] Kết nối MongoDB Atlas (Tài khoản chỉ đọc: user_read_23IT055) thành công!');
});

readConnection.on('error', (err) => {
  console.error('❌ [Least Privilege - READ] Lỗi kết nối tài khoản ĐỌC:', err.message);
});

// Tạo kết nối riêng biệt cho luồng GHI (Write Stream)
const writeConnection = mongoose.createConnection(MONGO_URI_WRITE, {
  serverSelectionTimeoutMS: 5000,
});

writeConnection.on('connected', () => {
  console.log('✅ [Least Privilege - WRITE] Kết nối MongoDB Atlas (Tài khoản ghi: user_write_23IT055) thành công!');
});

writeConnection.on('error', (err) => {
  console.error('❌ [Least Privilege - WRITE] Lỗi kết nối tài khoản GHI:', err.message);
});

module.exports = {
  readConnection,
  writeConnection,
};
