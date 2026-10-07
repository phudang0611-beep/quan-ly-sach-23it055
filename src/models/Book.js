const mongoose = require('mongoose');
const { readConnection, writeConnection } = require('../config/database');

const bookSchema = new mongoose.Schema(
  {
    bookCode: {
      type: String,
      required: [true, 'Mã sách không được để trống'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Tên sách không được để trống'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Tác giả không được để trống'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Công nghệ thông tin',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá sách không được để trống'],
      min: [0, 'Giá sách phải lớn hơn hoặc bằng 0'],
    },
    vatRate: {
      type: Number,
      default: 9, // VAT = (Chữ số cuối MSSV + 4)% = (5 + 4)% = 9%
    },
    priceWithVAT: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'books',
    timestamps: true,
  }
);

// Tạo Model phục vụ luồng ĐỌC (gắn với readConnection)
const ReadBook = readConnection.model('Book', bookSchema);

// Tạo Model phục vụ luồng GHI (gắn với writeConnection)
const WriteBook = writeConnection.model('Book', bookSchema);

module.exports = {
  ReadBook,
  WriteBook,
};
