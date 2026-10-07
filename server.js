/**
 * Ứng dụng Quản lý Sách - Bài thi Giữa kì Điện toán đám mây
 * Sinh viên: Lê Phú Đẳng - MSSV: 23IT055
 * 
 * Kiến trúc:
 * 1. Database Least Privilege: Tách riêng luồng Read (user_read_23IT055) và Write (user_write_23IT055)
 * 2. Stateless Session: Quản lý phiên tập trung qua MongoStore trên MongoDB Atlas (Auto-scaling ready)
 * 3. Thuật toán cá nhân hóa:
 *    - Bộ lọc mã sản phẩm: Tiền tố bắt buộc là 3 số cuối MSSV (055)
 *    - Thuế suất: VAT = (Chữ số cuối MSSV + 4)% = (5 + 4)% = 9%
 * 4. Handlebars Template Engine với Footer bắt buộc hiển thị Họ tên, MSSV, mức VAT.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');

const initSession = require('./src/config/session');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình View Engine Handlebars
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình Stateless Session lưu trực tiếp trên MongoDB Atlas (không lưu RAM)
app.use(initSession());

// Middleware tăng biến đếm lượt tương tác trong phiên để kiểm tra tính Stateless
app.use((req, res, next) => {
  if (req.session) {
    req.session.visitCount = (req.session.visitCount || 0) + 1;
  }
  next();
});

// Định tuyến các tuyến đường Quản lý Sách
app.use('/', bookRoutes);

// Khởi chạy máy chủ HTTP
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ỨNG DỤNG QUẢN LÝ SÁCH ĐANG CHẠY TẠI CỔNG: ${PORT}`);
  console.log(`👤 Sinh viên: Lê Phú Đẳng - MSSV: 23IT055`);
  console.log(`🔒 Bảo mật Least Privilege: 02 tài khoản Read / Write`);
  console.log(`☁️  Stateless Session: Lưu tập trung tại MongoDB Atlas`);
  console.log(`🌐 Truy cập cục bộ: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
