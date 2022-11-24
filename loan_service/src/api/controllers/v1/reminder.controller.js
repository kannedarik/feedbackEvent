const httpStatus = require('http-status');
const { reminder, loanTypes } = require('../../utils/constants');
const renewalUtils = require('../../utils/renewal.util');

// fetch all loans to be renewed
exports.reminderLoans = async (req, res, next) => {
  try {
    const { token, id } = req.user;
    const {
      groupBy, filterBy, reminderTypes, loanStatus, phone,
    } = req.query;
    const filters = {
      reminderTypes: reminderTypes ? reminderTypes.split(',') : [reminder.type.renewal],
      groupBy,
      filterBy,
      loanStatus: loanStatus ? loanStatus.split(',') : [],
      phone,
    };
    const loanReminders = await renewalUtils.fetchLoansReminders(token, id, filters);
    return res.json({
      status: httpStatus.OK,
      message: 'loans group reminders fetched successfully',
      data: loanReminders,
    });
  } catch (error) {
    return next(error);
  }
};


exports.loanCardReminders = async (req, res, next) => {
  try {
    const { token, id } = req.user;
    const {
      phone,
      type,
    } = req.query;
    const filters = {
      phone,
      type: type ? type.split(',') : [loanTypes.active],
    };
    const loanReminders = await renewalUtils.fetchLoanCardReminders(token, id, filters);

    return res.json({
      status: httpStatus.OK,
      message: 'loans card details fetched successfully',
      data: loanReminders,
    });
  } catch (error) {
    return next(error);
  }
};

exports.RenewalSmsReminder = async (req, res, next) => {
  try {
    const lenderlist = req.body.lenderids;
    const { getuserdetails } = req.body;
    const { token } = req.user;
    await Promise.map(lenderlist, async (lender) => {
      renewalUtils.renewalSMSReminderForALenderLoans({
        getuserdetails,
        lenderid: lender,
        dueDateLimit: reminder.renewalstages.renewalupcoming,
      }, token);
    });
    return res.json({ status: httpStatus.OK, Message: 'renewal reminder sms sent successfully' });
  } catch (error) {
    return next(error);
  }
};
