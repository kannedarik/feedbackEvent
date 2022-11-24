module.exports = {
  transactionString: 'Transaction file not recived',
  misString: 'MIS file not recived',
  emails: {
    notificationemails: [process.env.NOTIFICATION_EMAIL],
    ccemails: [process.env.CCEMAIL],
    sourceemail: 'Notifications@rupeek.com',
  },
  privateaKeyPath: 'src/tmp/datasync.pem',
};
