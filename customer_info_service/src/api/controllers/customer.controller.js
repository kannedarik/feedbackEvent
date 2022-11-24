/* eslint-disable max-len */
const { map, find } = require('lodash');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

const {
  Sequelize,
  Customer,
  CustomerPhone,
  LenderCustomerPhone,
} = global.sequelize;

/**
 * Get all lender customer phones
 * @public
 */
exports.lenderphones = async (req, res, next) => {
  try {
    const customerid = req.user.id;
    const customer = await Customer.findOne({
      where: {
        mongoid: customerid,
      },
    });
    if (!customer) throw new APIError({ status: httpStatus.NOT_FOUND, message: 'No customer is present with this id' });
    const customerphones = await CustomerPhone.findAll({
      where: {
        customer: customer.id,
      },
    });
    let lenderphones = [];
    if (customerphones && customerphones.length) {
      const lendercustomerphones = await LenderCustomerPhone.findAll({
        where: {
          phone: {
            [Sequelize.Op.in]: map(customerphones, customerphone => customerphone.id),
          },
          lender: req.query.lender,
        },
      });
      lenderphones = map(lendercustomerphones, lendercustomerphone => find(customerphones, { id: lendercustomerphone.phone }).phone);
    }
    return res.json({ code: httpStatus.OK, message: 'Lender Phones fetched successfully', lenderphones });
  } catch (error) {
    return next(error);
  }
};
