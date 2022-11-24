
const { s3keyprefix } = require('../../config/vars');

exports.getLenders = () => [
  {
    id: 1,
    mongoid: '5a43cfbebc40a39a3bc1207d',
    name: 'Federal Bank Limited',
    goldrate: 'ibja',
    slug: 'federal',
    email: `${s3keyprefix}-federal@mail-datasync.rupeek.co`,
    archived: false,
  },
  {
    id: 4,
    mongoid: '5cdd3ebad54a11e613c3a6b5',
    name: 'Karur Vysya Bank',
    goldrate: 'kvb',
    slug: 'kvb',
    email: `${s3keyprefix}-kvb@mail-datasync.rupeek.co`,
    archived: false,
  },
  {
    id: 5,
    mongoid: '5d75924e5bf87df5130767ae',
    name: 'ICICI Bank',
    goldrate: 'icici',
    slug: 'icici',
    email: `${s3keyprefix}-icici@mail-datasync.rupeek.co`,
    archived: false,
  },
];

exports.getcontenttype = () => [
  {
    type: 'zip',
    contentType: 'application/zip',
  },
  {
    type: 'csv',
    contentType: 'text/csv',
  },
  {
    type: 'xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    type: 'xls',
    contentType: 'application/vnd.ms-excel',
  },
];
