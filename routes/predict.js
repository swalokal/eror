const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const controller = require('../controllers/PredictController');

const storage = new Storage({
  projectId: 'swalokal',
  keyFilename: './key.json',
});

const bucketName = 'swalokal1';
const bucket = storage.bucket(bucketName);

const filename = `test-image-${Date.now().toString()}.jpg`;

// configure multer
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage, fileFilter: imageFileFilter });

function imageFileFilter(req, file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = file.originalname.match(filetypes);
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const router = express.Router();

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ success: false, message: 'Please Upload A File!' });
    }

    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', () => {
      req.filename = filename;
      controller.makePredictions(req, res, next);
    });

    blobStream.end(file.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
