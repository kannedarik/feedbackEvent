const mongoose = require('mongoose');

const tempFileStoreSchema = new mongoose.Schema({
  GLId: {
    type: String,
    required: true,
  },
  scheme: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
}, { timestamps: false });

module.exports = mongoose.model('TempFileStore', tempFileStoreSchema);
