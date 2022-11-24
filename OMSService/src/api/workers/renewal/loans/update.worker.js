const path = require('path');
const CoreService = require('../../../services/core.service');
const ErrorHandler = require('../../../utils/error');
const {
  coreSigningMethodMap, coreSigningStatusMap,
} = require('../../../utils/constants');
const { supportJwtToken } = require('../../../../config/vars');

const signingData = (variables) => {
  if (variables.signingmethod === 'digital' || variables.signingmethod === '2fa') {
    const [otp] = variables.signingrequests.map((request) => request.otp);
    return {
      otp,
    };
  }
  if (variables.signingmethod === 'esign') {
    return {
      ...(variables.secureddocument && {
        signedpc: path.parse(variables.secureddocument.path).name,
      }),
      ...(variables.unsecureddocument && {
        usignedpc: path.parse(variables.unsecureddocument.path).name,
      }),
      ...(variables.renewalLetter && {
        renewalLetter: path.parse(variables.renewalLetter.path).name,
      }),
    };
  }
  return true;
};

module.exports = () => ({
  taskType: 'renewal.loans.update',
  taskHandler: async (job) => {
    try {
      await CoreService.updateRenewalStatus(supportJwtToken, {
        refno: job.variables.orderid,
        signstatus: coreSigningStatusMap[job.variables.signingstatus],
        signtype: coreSigningMethodMap[job.variables.signingmethod],
        ...(job.variables.signingstatus === 'success' && signingData(job.variables)),
      });
      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
