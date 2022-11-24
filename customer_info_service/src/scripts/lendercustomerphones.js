/* eslint-disable no-console */
const csv = require('csv-parser');
const fs = require('fs');
const {
  isEmpty,
} = require('lodash');
const Promise = require('bluebird');

const sequelize = require('../config/sequelize');
// Init sequelize
sequelize.init();

const {
  Customer,
  LenderCustomer,
  CustomerPhone,
  LenderCustomerPhone,
} = global.sequelize;

const lendercustomerphones = async (filepath) => {
  try {
    let count = 0;
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', async (data) => {
        try {
          const lenderref = data.CUST_ID;
          const lenderphone = data.CONTACT_NUMBER;
          const altlenderphone = data.ADDITIONAL_NUMBER;
          const rupeekmongoid = data.CORE_REFID;
          const lender = '5a43cfbebc40a39a3bc1207d';
          const customer = await Customer.findOne({
            where: {
              mongoid: rupeekmongoid,
            },
          });
          if (customer) {
            const lendercustomer = await LenderCustomer.findOne({
              where: {
                customer: customer.id,
                lender,
              },
            });
            lendercustomer.lender_ref = lenderref;
            await lendercustomer.save();
            const phones = [];
            if (!isEmpty(lenderphone)) phones.push(lenderphone.slice(2));
            if (!isEmpty(altlenderphone)) phones.push(altlenderphone.slice(2));
            // Create and check phone entries
            const lenderphones = await Promise.map(phones, async (phone) => {
              const [customerphone] = await CustomerPhone.findOrCreate({
                where: {
                  customer: customer.id,
                  phone,
                },
                defaults: {
                  verified: false,
                },
              });

              return {
                // id: uuid(),
                phone: customerphone.id,
                lender,
                primary: false,
              };
            });
            await LenderCustomerPhone.bulkCreate(lenderphones);
            count += 1;
            console.log('Count: ', count);
          } else {
            console.log('Customer not found: ', rupeekmongoid);
          }
        } catch (error) {
          console.log('ERROR: ', error);
        }
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
      });
  } catch (error) {
    console.log(error);
  }
};

lendercustomerphones('/Users/nikhilpatil/workspace/sangraha/customer_info_service/src/scripts/data/lendercustomerphones.csv');
