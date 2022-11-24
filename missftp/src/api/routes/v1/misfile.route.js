const express = require('express');
// const { celebrate: validate } = require('celebrate');
const controller = require('../../controllers/missftp.controller');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/misfile Create FileProcessor
   * @apiDescription Create FileProcessor
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup FileProcessor
   * @apiPermission public
   *
   * @apiSuccess {Object} FileProcessor
   */
  .get(controller.pullSFTP);

router
  .route('/raisealert')
  /**
   * @api {post} api/v1/misfile Create FileProcessor
   * @apiDescription Create FileProcessor
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup FileProcessor
   * @apiPermission public
   *
   * @apiSuccess {Object} FileProcessor
   */
  .get(controller.raiseAlert);


module.exports = router;
