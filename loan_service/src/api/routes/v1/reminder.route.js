const express = require('express');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v1/reminder.controller');

const router = express.Router();

router
  .route('/loans')
  /**
   * @api {post} api/v1/renewal/loans Get grouped loans List
   * @apiDescription Get Grouped loans List eligible for renewal
   * @apiVersion 1.0.0
   * @apiName renewalLoans
   * @apiGroup renewalapi
   * @apiPermission customer, admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .get(authorize(['customer', 'support']), controller.reminderLoans);

router
  .route('/loancarddetails')
  /**
   * @api {get} api/v1/reminders/loanCardDetails gets loan Card View Details
   * @apiDescription gets loan Card View Details
   * @apiVersion 1.0.0
   * @apiName loanCard Details
   * @apiGroup customer, support
   * @apiPermission customer, support
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .get(authorize(['customer', 'support']), controller.loanCardReminders);

router
  .route('/sms')
  /**
   * @api {post} api/v1/reminder/sms
   * @apiDescription Get loans List eligible for renewal and send sms to user
   * @apiVersion 1.0.0
   * @apiName renewal sms reminder
   * @apiGroup Agent
   * @apiPermission admin, citymanager
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .post(authorize(['customer', 'support']), controller.RenewalSmsReminder);

module.exports = router;
