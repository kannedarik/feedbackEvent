const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize, authorizeKey } = require('../../middlewares/auth');
const multer = require('../../middlewares/multer');
const controller = require('../../controllers/differentialscheme.controller');
const {
  bulkupload,
  filter,
  template,
  fetch,
  downloadErrorFile,
} = require('../../validations/v1/differentialscheme.validation');

const router = express.Router();

router
  .route('/bulkupload')
  /**
   * @api {post} api/v1/differentialscheme/bulkupload Bulk Upload a File
   * @apiDescription Bulk Upload a File with the given {filename}
   * @apiVersion 1.0.0
   * @apiName Bulk Upload
   * @apiGroup BulkUpload
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Orders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can upload a file
   * @apiError (Forbidden 403)     Forbidden     Only admin can upload a file
   */
  .post(authorize(['support']), multer('file'), validate(bulkupload), controller.bulkuploadFile);

router
  .route('/download')
  /**
   * @api {post} api/v1/differentialscheme/download/ gets fitlered data in LoanToScheme Mapping
   * @apiDescription gets fitlered data in LoanToScheme Mapping
   * @apiVersion 1.0.0
   * @apiName differentialscheme
   * @apiGroup differentialscheme
   * @apiPermission public
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(filter), controller.downloadFiltered);

router
  .route('/downloadSample')
  /**
   * @api {post} api/v1/differentialscheme/downloadSample/:template gets sample template
   * @apiDescription Gets the csv string for the template files (headers for csv)
   * @apiVersion 1.0.0
   * @apiName differentialscheme
   * @apiGroup differentialscheme
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(template), authorize(['support']), controller.downloadTemplate);

router
  .route('/schemes')
  /**
   * @api {get} api/v1/differentialscheme/schemes
   *    gets the overridden scheme for the selected, total and pending loans list mentioned
   * @apiDescription gets the overridden scheme for selected,total and pending loans list mentioned
   * @apiVersion 1.0.0
   * @apiName differentialscheme
   * @apiGroup differentialscheme
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(authorizeKey(), validate(fetch), controller.fetchOverriddenSchemes);

router
  .route('/errorfile')
  /**
   * @api {post} api/v1/differentialscheme/errorfile gets Bulk Upload error file
   * @apiDescription gets the Bulk Upload Error file;
   * @apiVersion 1.0.0
   * @apiName differentialscheme
   * @apiGroup differentialscheme
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(downloadErrorFile), authorize(['support']), controller.downloadS3ErrorFile);

module.exports = router;
