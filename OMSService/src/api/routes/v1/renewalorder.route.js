const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/renewalorder.controller');
const {
  create,
  cancel,
  active,
  read,
  signingmethod,
  paymentmethod,
  listESign,
  updateSigningMethod,
  verifyDigiSign,
  fetchDigiSignCode,
  viewDocument,
  viewSignedDocument,
  getPaymentLink,
  signingsms,
  getOtpFromOrderId,
  updateorder,
  initiateCancellation,
  validateAadhar,
} = require('../../validations/v1/renewalorder.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/orders/renewals Create Renewal Order
   * @apiDescription Create Renewal Order
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} RenewalOrder
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .post(validate(create), authorize(['customer']), controller.create);

router
  .route('/active')
  /**
   * @api {get} api/v1/orders/renewals/active Active Renewal Order
   * @apiDescription Active Renewal Order
   * @apiVersion 1.0.0
   * @apiName Active
   * @apiGroup RenewalOrder
   * @apiPermission support
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} RenewalOrder
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only support can access the data
   */
  .get(validate(active), authorize(['support']), controller.active);

router
  .route('/:orderId')
  /**
   * @api {get} api/v1/orders/renewals/:orderId Read Renewal Order
   * @apiDescription Read Renewal Order
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} RenewalOrder
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(read), authorize(['customer']), controller.read);

router
  .route('/:processId')
  /**
   * @api {delete} api/v1/orders/renewals/:processId Cancel Renewal Order
   * @apiDescription Cancel Renewal Order
   * @apiVersion 1.0.0
   * @apiName Cancel
   * @apiGroup RenewalOrder
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Status
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .delete(validate(cancel), authorize(['admin']), controller.cancel);

router
  .route('/:orderId/signingmethods')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/signingmethods List Signing Methods
   * @apiDescription List Signing Methods
   * @apiVersion 1.0.0
   * @apiName ListSigningMethods
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} SigningMethod
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(signingmethod), authorize(['customer']), controller.listSigningMethods);

router
  .route('/:orderId/paymentmethods')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/paymentmethods List Payment Methods
   * @apiDescription List Payment Methods
   * @apiVersion 1.0.0
   * @apiName ListPaymentMethods
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} PaymentMethods
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(paymentmethod), authorize(['customer']), controller.listPaymentMethods);

router
  .route('/:orderId/signingmethods')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/signingmethods Update Signing Methods
   * @apiDescription Update Signing Methods
   * @apiVersion 1.0.0
   * @apiName UpdateSigningMethods
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Status and Message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .put(validate(updateSigningMethod), authorize(['customer']), controller.updateSigningMethod);

router
  .route('/:orderId/signingmethods/sms')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/signingmethods/sms Send Signing SMS
   * @apiDescription Send Signing SMS
   * @apiVersion 1.0.0
   * @apiName SendSigningSMS
   * @apiGroup RenewalOrder
   * @apiPermission support
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Status and Message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only support can access the data
   */
  .put(validate(signingsms), authorize(['support']), controller.sendSigningSMS);

router
  .route('/:orderId/esign')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/esign List ESign Request
   * @apiDescription List ESign Request
   * @apiVersion 1.0.0
   * @apiName ListESign
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} SigningRequests
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(listESign), authorize(['customer']), controller.listESign);

router
  .route('/:orderId/digisign/verify')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/digisign/verify Verify DigiSign
   * @apiDescription Verify DigiSign
   * @apiVersion 1.0.0
   * @apiName VerifyDigiSign
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Status and message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .put(validate(verifyDigiSign), authorize(['customer']), controller.verifyDigiSign);

router
  .route('/:orderId/digisign/otp')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/digisign/otp Fetch DigiSign Code
   * @apiDescription Fetch DigiSign Code
   * @apiVersion 1.0.0
   * @apiName FetchDigiSignCode
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Status and message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .put(validate(fetchDigiSignCode), authorize(['customer']), controller.fetchDigiSignCode);

router
  .route('/:orderId/document')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/document View Unsigned Document
   * @apiDescription View Unsigned Document
   * @apiVersion 1.0.0
   * @apiName ViewUnsignedDocument
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Unsigned Document
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(viewDocument), authorize(['customer']), controller.viewUnSignedDoc);

router
  .route('/:orderId/signeddocuments')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/signeddocuments View Signed Document
   * @apiDescription View Signed Document
   * @apiVersion 1.0.0
   * @apiName ViewSignedDocument
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Signed Document
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(viewSignedDocument), authorize(['customer']), controller.viewSignedDoc);

router
  .route('/:orderId/payment')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/payment Generate Payment Link
   * @apiDescription Generate Payment Link
   * @apiVersion 1.0.0
   * @apiName GeneratePaymentLink
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Payment Link
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .put(validate(getPaymentLink), authorize(['customer']), controller.generatePayLink);

router
  .route('/:orderId/otp')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/otp Fetches OTP from OrderId
   * @apiDescription Fetches OTP from OrderId
   * @apiVersion 1.0.0
   * @apiName GetOtpFromOrderId
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Payment Link
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(getOtpFromOrderId), authorize(['customer']), controller.getOtpFromOrderId);

router
  .route('/:orderId/updateorder')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/updateorder Updates order details from OrderId
   * @apiDescription Updates order details from OrderId
   * @apiVersion 1.0.0
   * @apiName updateOrder
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Payment Link
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .put(validate(updateorder), authorize(['customer']), controller.updateOrder);

router
  .route('/kglrenewal')
  /**
   * @api {post} api/v1/orders/renewals Create Renewal Order for Kgl loan
   * @apiDescription Create Renewal Order for Kgl loan from older android version
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} RenewalOrder
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .post(authorize(['customer']), controller.createOrderForKgl);

router
  .route('/:orderId/bankverification')
  /**
   * @api {put} api/v1/orders/renewals/:orderId/bankverification Lock Bank Verification
   * @apiDescription Lock Bank Verification
   * @apiVersion 1.0.0
   * @apiName LockBankVerification
   * @apiGroup RenewalOrder
   * @apiPermission support
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Status and Message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only support can access the data
   */
  .put(authorize(['support']), controller.lockBankVerification);

router
  .route('/cancellation/initiate')
  /**
   * @api {post} api/v1/orders/renewals/cancellation/initiate
   * @apiDescription Initiate cancellation of renewal order
   * @apiVersion 1.0.0
   * @apiName Initiate renewal cancellation
   * @apiGroup RenewalOrder
   * @apiPermission support
   *
   * @apiHeader {String} Authorization Customer token
   *
   * @apiSuccess {Object}
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can initiate cancellation
   * @apiError (Forbidden 403) Forbidden        Only support agents can initiate cancellation
   */
  .post(validate(initiateCancellation), authorize(['support']), controller.initiateCancellation);

router
  .route('/:orderId/validateaadhar')
  /**
   * @api {get} api/v1/orders/renewals/:orderId/validateaadhar
   * @apiDescription returns aadhar verification status
   * @apiVersion 1.0.0
   * @apiName aadhar verification status
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization Customer token
   *
   * @apiSuccess {Object}
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users access the data
   * @apiError (Forbidden 403) Forbidden       Only customers can access the data
   */
  .get(authorize(['customer']), controller.aadharVerificationStatus);

router
  .route('/:orderId/validateaadhar')
  /**
   * @api {post} api/v1/orders/renewals/:orderId/validateaadhar
   * @apiDescription validates aadhar suffix and returns the status
   * @apiVersion 1.0.0
   * @apiName  validates aadhar suffix
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization Customer token
   *
   * @apiSuccess {Object}
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can vaildate the aadhar suffix
   * @apiError (Forbidden 403) Forbidden        Only customers can vaildate the aadhar suffix
   */
  .post(validate(validateAadhar), authorize(['customer']), controller.validateAadhar);

router
  .route('/:orderId/pinverification')
  /**
   * @api {post} api/v1/orders/renewals/:orderId/pinverification
   * @apiDescription validates pin authenticated token
   * @apiVersion 1.0.0
   * @apiName  validates pin authenticated token
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization Customer token
   *
   * @apiSuccess {Object}
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can verify their pin
   * @apiError (Forbidden 403) Forbidden        Only customers agents can verify their pin
   */
  .post(authorize(['customer'], true), controller.pinVerification);

module.exports = router;
