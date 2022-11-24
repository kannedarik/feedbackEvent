const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v1/lms.controller');
const { loandetails } = require('../../validations/lms.validation');

const router = express.Router();

router
  .route('/loans')
  .get(authorize(['support', 'techsupport', 'boadmin']), controller.loans);

router
  .route('/loandetails')
  .get(validate(loandetails, { allowUnknown: true }), authorize(['support', 'techsupport', 'boadmin']), controller.loandetails);

module.exports = router;
