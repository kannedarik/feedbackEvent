const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/esignrequest.controller');
const {
  create,
} = require('../../validations/v1/esignrequest.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/requests/esign Create ESign Request
   * @apiDescription Create ESign Request
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup ESignRequest
   * @apiPermission client
   *
   * @apiSuccess {Object} ESignRequest
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   *
   */
  .post(validate(create), authorizeKey(), controller.create);

module.exports = router;
