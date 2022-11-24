const axios = require('axios');
const { services, supportJwtToken } = require('../../config/vars');
const { logger } = require('../../config/logger');
/*
Api to update the loan Status in account service
*/
exports.updateLoanStatus = async (lmsid,lenderSlug, status) => {
  const options = {
    url: `${services.account.endpoint}${services.account.updateloanstatus}/${lenderSlug}/${lmsid}`,
    method: 'PATCH',
    headers: {
      Authorization: `JWT ${supportJwtToken}`,
    },
    data: {
      status,
    },
  };
  logger.info(`calling account service to update loanstatus with payload: ${JSON.stringify(options)}`);
  const response = await axios(options);
  return response;
};
