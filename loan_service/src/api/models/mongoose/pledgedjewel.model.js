const mongoose = require('mongoose');

const pledgedjewelSchema = new mongoose.Schema({
  ornamenttype: {
    type: String,
  },
  haircut: {
    type: Number,
  },
  goldprice: {
    type: Number,
  },
  noofitems: {
    type: Number,
  },
  grossweight: {
    type: Number,
  },
  eligibleweight: {
    type: Number,
  },
  stoneadjustment: {
    type: Number,
  },
  otheradjustment: {
    type: Number,
  },
  purity: {
    type: Number,
  },
  picture: {
    type: String,
  },
  jewelpicture: {
    type: String,
  },
  stonepicture: {
    type: String,
  },
  aijewelpicture: {
    type: String,
  },
  aijewelstatus: {
    type: Boolean,
  },
  aistonepicture: {
    type: String,
  },
  aistonestatus: {
    type: Boolean,
  },
  jewelworth: {
    type: Number,
  },
  packno: {
    type: String,
  },
  smartdna: {
    type: Boolean,
  },
  archivedpacketno: {
    type: String,
  },
  custarchived: {
    type: Boolean,
  },
  archived: {
    type: Boolean,
  },
  damaged: {
    type: Boolean,
  },
  damagelist: {
    type: Array,
  },
  ishallmark: {
    type: Boolean,
  },
  haswax: {
    type: Boolean,
  },
  hasstone: {
    type: Boolean,
  },
  stonetype: {
    type: String,
  },
  aistonededuction: {
    type: Number,
  },
  aipurity: {
    type: Number,
  },
  notes: {
    type: String,
  },
  deviceinfo: {
    type: mongoose.Schema.Types.Mixed,
  },
  pledgedin: {
    type: mongoose.Schema.ObjectId,
    ref: 'LoanRequest',
  },
}, {
  collection: 'pledgedjewel',
});

pledgedjewelSchema.set('toObject', { getters: true });
pledgedjewelSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Pledgedjewel', pledgedjewelSchema);
