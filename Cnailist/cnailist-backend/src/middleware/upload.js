const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

function makeStorage(folder) {
  const dir = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename:    (req, file, cb) => {
      const ext  = path.extname(file.originalname);
      const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
      cb(null, name);
    },
  });
}

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext     = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime    = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF'));
}

// Upload bukti pembayaran (1 file)
const uploadPaymentProof = multer({
  storage:  makeStorage('payments'),
  limits:   { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter,
}).single('proof');

// Upload gambar produk (1 file)
const uploadProductImage = multer({
  storage:  makeStorage('products'),
  limits:   { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter,
}).single('image');

// Upload referensi custom order (max 3 file)
const uploadCustomImages = multer({
  storage:  makeStorage('custom'),
  limits:   { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter,
}).array('images', 3);

// Upload foto chat (1 file)
const uploadChatImage = multer({
  storage:  makeStorage('chat'),
  limits:   { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter,
}).single('image');

module.exports = { uploadPaymentProof, uploadProductImage, uploadCustomImages, uploadChatImage };
