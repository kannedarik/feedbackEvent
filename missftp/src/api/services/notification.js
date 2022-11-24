const AWS = require('aws-sdk');

const ses = new AWS.SES({
  region: 'us-east-1',
});

const { transactionString, misString, emails } = require('../utils/constants');

exports.raiselenderalert = async (options) => {
  if (options.type === 'trans' && (options.lender === 'kvb' || options.lender === 'icici')) {
    return true;
  }
  const emailstring = options.type === 'trans' ? transactionString : misString;
  const emailResponse = await ses
    .sendEmail({
      Source: emails.sourceemail,
      Destination: {
        ToAddresses: emails.notificationemails,
        CcAddresses: emails.ccemails,
      },
      Message: {
        Subject: {
          Data: `${emailstring} ${options.lender}`,
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: `${emailstring} ${options.lender}`,
          },
        },
      },
    })
    .promise();
  return emailResponse;
};
