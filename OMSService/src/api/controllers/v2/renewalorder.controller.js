/* eslint-disable max-len */
const { map } = require('lodash');
const httpStatus = require('http-status');
const moment = require('moment');
const OrderType = require('../../models/ordertype.model');
const RenewalOrder = require('../../models/renewalorder.model');
const CoreService = require('../../services/core.service');
const { coreSigningMethodMap } = require('../../utils/constants');
const { logger } = require('../../../config/logger');

/**
 * Create RenewalOrder V2 API
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOne({ name: 'renewal', archived: false });
    const order = await RenewalOrder.createOrder(req.body, ordertype, req.user, false, 2);
    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'Renewal Order created successfully', order: order.orderId });
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

/**
 * View Unsigned Document V2
 * @public
 */
exports.viewUnSignedDoc = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: 'pending',
      signingstatus: {
        $ne: 'success',
      },
      signingmethod: {
        $exists: true,
      },
    }).populate('items');

    if (order) {
      const data = {
        loandetails: map(order.items, (item) => ({
          ...item.meta,
          loanid: item.meta.losid,
          ...(item.meta.oldunsecureamount && { oldunsecureamount: item.meta.oldunsecureamount }),
          newunsecureamount: item.meta.newunsecureamount,
          oldschemeid: item.meta.oldscheme.id,
          newschemeid: item.meta.newscheme.id,
          oldcoreschemeid: item.meta.oldscheme.coreSchemeId,
          newcoreschemeid: item.meta.newscheme.coreSchemeId,
          oldmasterschemeid: item.meta.oldscheme.masterSchemeId,
          newmasterschemeid: item.meta.newscheme.masterSchemeId,
          oldloandate: moment(item.meta.oldloandate).format('YYYY-MM-DD'),
          newloandate: moment(item.meta.newloandate).format('YYYY-MM-DD'),
          ...(item.meta.newsecuredisbursalamount && item.meta.newsecurecharges && {
            newsecuredisbursalamount: item.meta.newsecuredisbursalamount,
            newsecurecharges: item.meta.newsecurecharges,
          }),
        })),
        signtype: coreSigningMethodMap[order.signingmethod.name],
        schemeengine: true,
      };
      const response = await CoreService.viewUnSignedPC(req.user.token, data);
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: response.UserMsg,
        docurl: response.link,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};
