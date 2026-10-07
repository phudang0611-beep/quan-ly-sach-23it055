/**
 * Controller Quản lý Sách - Đề thi Giữa Kì
 * Sinh viên: Lê Phú Đẳng - MSSV: 23IT055
 */

const { ReadBook, WriteBook } = require('../models/Book');

// Thông tin cá nhân hóa theo đề bài
const STUDENT_INFO = {
  name: 'Lê Phú Đẳng',
  studentId: '23IT055',
  lastThreeDigits: '055', // 3 số cuối MSSV (dùng làm tiền tố mã sản phẩm)
  lastDigit: 5,           // Chữ số cuối MSSV
  vatRate: 5 + 5,         // VAT = (Chữ số cuối MSSV + 5)% = (5 + 5)% = 10%
};

/**
 * Hiển thị danh sách sách (Luồng ĐỌC - Định tuyến qua Read Connection)
 */
const getBooks = async (req, res) => {
  try {
    // Truy vấn dữ liệu hoàn toàn thông qua ReadBook (kết nối tài khoản chỉ đọc)
    const books = await ReadBook.find().sort({ createdAt: -1 }).lean();

    // Lấy thông báo từ session (nếu có)
    const successMsg = req.session ? req.session.successMsg : null;
    const errorMsg = req.session ? req.session.errorMsg : null;

    // Xóa flash message sau khi đọc
    if (req.session) {
      delete req.session.successMsg;
      delete req.session.errorMsg;
    }

    res.render('books/list', {
      title: 'Hệ thống Quản lý Sách - Cloud Computing',
      books,
      studentInfo: STUDENT_INFO,
      successMsg,
      errorMsg,
      sessionID: req.sessionID || 'Chưa khởi tạo',
      visitCount: req.session ? req.session.visitCount : 1,
    });
  } catch (error) {
    console.error('Lỗi khi đọc danh sách sách:', error);
    res.status(500).render('error', {
      message: 'Lỗi truy vấn cơ sở dữ liệu qua tài khoản ĐỌC: ' + error.message,
      studentInfo: STUDENT_INFO,
    });
  }
};

/**
 * Thêm mới sách (Luồng GHI - Định tuyến qua Write Connection)
 */
const createBook = async (req, res) => {
  try {
    const { bookCode, title, author, category, price } = req.body;

    // 1. Kiểm tra trường bắt buộc
    if (!bookCode || !title || !author || !price) {
      if (req.session) {
        req.session.errorMsg = 'Vui lòng điền đầy đủ các thông tin bắt buộc!';
      }
      return res.redirect('/');
    }

    const trimmedCode = bookCode.trim();

    // 2. Thuật toán cá nhân hóa: Bộ lọc kiểm tra tiền tố 3 số cuối MSSV (055)
    if (!trimmedCode.startsWith(STUDENT_INFO.lastThreeDigits)) {
      const errorText = `[TỪ CHỐI XỬ LÝ] Mã sản phẩm bắt buộc phải có tiền tố là 3 số cuối MSSV (${STUDENT_INFO.lastThreeDigits}). Mã nhập vào: "${trimmedCode}" không hợp lệ!`;
      if (req.session) {
        req.session.errorMsg = errorText;
      }
      return res.redirect('/');
    }

    const basePrice = parseFloat(price);
    if (isNaN(basePrice) || basePrice < 0) {
      if (req.session) {
        req.session.errorMsg = 'Giá tiền không hợp lệ!';
      }
      return res.redirect('/');
    }

    // 3. Thuật toán cá nhân hóa: Tính thuế suất VAT động = (Chữ số cuối MSSV + 5)%
    // MSSV 23IT055 -> số cuối = 5 -> VAT = 10%
    const vatRate = STUDENT_INFO.vatRate;
    const priceWithVAT = Math.round(basePrice * (1 + vatRate / 100));

    // 4. Ghi dữ liệu thông qua WriteBook (kết nối tài khoản GHI)
    await WriteBook.create({
      bookCode: trimmedCode,
      title: title.trim(),
      author: author.trim(),
      category: category ? category.trim() : 'Chung',
      price: basePrice,
      vatRate: vatRate,
      priceWithVAT: priceWithVAT,
    });

    if (req.session) {
      req.session.successMsg = `Thêm sách "${title}" thành công! Giá gốc: ${basePrice.toLocaleString('vi-VN')} đ, Giá sau thuế (${vatRate}%): ${priceWithVAT.toLocaleString('vi-VN')} đ`;
    }

    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi ghi sách mới:', error);
    if (req.session) {
      if (error.code === 11000) {
        req.session.errorMsg = `Lỗi: Mã sách đã tồn tại trong cơ sở dữ liệu!`;
      } else {
        req.session.errorMsg = `Lỗi ghi dữ liệu qua tài khoản GHI: ${error.message}`;
      }
    }
    res.redirect('/');
  }
};

module.exports = {
  STUDENT_INFO,
  getBooks,
  createBook,
};
