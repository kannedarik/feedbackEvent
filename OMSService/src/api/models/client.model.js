const { pick } = require('lodash');
const mongoose = require('mongoose');
const clientid = require('order-id');
const uuidAPIKey = require('uuid-apikey');
const { secretKey } = require('../../config/vars');

/**
 * Client Schema
 * @private
 */
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  apikey: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

clientSchema.virtual('token').get(function getKey() {
  return uuidAPIKey.toAPIKey(this.apikey);
});

/**
 * Methods
 */
clientSchema.method({
  verifyAPIKey(key) {
    return uuidAPIKey.check(key, this.apikey);
  },
});

/**
 * Statics
 */
clientSchema.statics = {
  async createClient(data) {
    const username = clientid(secretKey).generate();
    const { uuid } = uuidAPIKey.create();
    const client = await this.create({
      ...data,
      username,
      apikey: uuid,
    });
    return client;
  },

  async updateClient(query, data, resetKey = false) {
    const { uuid } = uuidAPIKey.create();

    const updatedData = {
      ...data,
      ...(resetKey && { apikey: uuid }),
    };
    const client = await this.findOneAndUpdate(query, updatedData, { new: true });
    return client;
  },
};

clientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description', 'username', 'token']),
});

/**
 * @typedef Client
 */
module.exports = mongoose.model('Client', clientSchema);
