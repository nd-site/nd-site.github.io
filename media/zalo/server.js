// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5110;
const ZALO_API_KEY = process.env.ZALO_API_KEY;
const ZALO_OCR_ENDPOINT = process.env.ZALO_OCR_ENDPOINT; // vd: https://api.zalo.ai/v1/ocr

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// OCR route: nhận file từ frontend và chuyển tiếp lên Zalo AI
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Thiếu file ảnh' });
    }
    if (!ZALO_API_KEY || !ZALO_OCR_ENDPOINT) {
      return res.status(500).json({ error: 'Thiếu cấu hình API key hoặc endpoint' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'upload.jpg',
      contentType: req.file.mimetype || 'image/jpeg',
    });

    const response = await axios.post(ZALO_OCR_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${ZALO_API_KEY}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.json(response.data);
  } catch (err) {
    console.error('OCR error:', err?.response?.data || err.message);
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: 'Lỗi gọi OCR' };
    res.status(status).json(data);
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
});
