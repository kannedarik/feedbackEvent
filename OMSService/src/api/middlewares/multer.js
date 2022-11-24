const httpStatus = require('http-status');
const multer = require('multer');
const path = require('path');
const APIError = require('../utils/APIError');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, path.resolve(__dirname, '../../'));
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

const upload = (filename) => multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter(req, file, cb) {
    // Set the filetypes, it is optional
    const filetypes = /csv/;
    const mimetype = filetypes.test(file.mimetype);

    const extname = filetypes.test(
      path.extname(
        file.originalname,
      ).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    return cb(
      new APIError({
        message: 'File upload only supports the following filetypes - CSV',
        status: httpStatus.BAD_REQUEST,
      }),
    );
  },
  onError(error, next) {
    next(error);
  },

// mypic is the name of file attribute
}).single(filename);

module.exports = upload;
