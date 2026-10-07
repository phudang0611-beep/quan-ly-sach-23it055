/**
 * Cấu hình Stateless Session - Đề thi Giữa Kì
 * Sinh viên: Lê Phú Đẳng - MSSV: 23IT055
 * 
 * Yêu cầu:
 * - Để hệ thống có thể co giãn (Auto-scaling) trên Cloud mà không bị mất phiên làm việc,
 *   tuyệt đối không lưu Session trong RAM máy chủ (MemoryStore).
 * - Lưu trữ tập trung Session trực tiếp xuống Cloud MongoDB Atlas (sử dụng MongoStore).
 */

const session = require('express-session');
const MongoStore = require('connect-mongo');

const initSession = () => {
  const sessionUrl =
    process.env.MONGO_URI_SESSION ||
    process.env.MONGO_URI_WRITE ||
    'mongodb://localhost:27017/DB_23IT055_session';

  return session({
    secret: process.env.SESSION_SECRET || 'Secret_Key_LePhuDang_23IT055',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: sessionUrl,
      collectionName: 'sessions', // Bảng lưu trữ Session tập trung trên MongoDB Atlas
      ttl: 24 * 60 * 60, // Hạn dùng 1 ngày (tự động dọn dẹp)
      autoRemove: 'native',
      touchAfter: 24 * 3600, // Chỉ cập nhật session 1 lần mỗi 24h nếu dữ liệu không đổi
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 ngày
      httpOnly: true,
      secure: false, // Để false để hỗ trợ cả HTTP cục bộ và reverse proxy trên Render
      sameSite: 'lax',
    },
  });
};

module.exports = initSession;
