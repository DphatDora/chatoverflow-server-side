const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadDir = `public/${process.env.UPLOAD_BLOG_PATH}`;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, fileName);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Chỉ cho phép upload file ảnh'), false);
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
