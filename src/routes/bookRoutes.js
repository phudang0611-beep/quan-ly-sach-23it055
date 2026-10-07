const express = require('express');
const router = express.Router();
const { getBooks, createBook } = require('../controllers/bookController');

// Tuyến đường ĐỌC (Read) -> gọi getBooks (truy vấn qua Read Connection)
router.get('/', getBooks);

// Tuyến đường GHI (Write) -> gọi createBook (ghi dữ liệu qua Write Connection)
router.post('/books', createBook);

module.exports = router;
