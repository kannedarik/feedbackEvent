/* eslint-disable no-unused-vars */
const promise = require('bluebird');
const converter = require('json-2-csv');
const unzipper = require('unzipper');
const xls = require('node-xlsx');
const misfile = require('../../api/models/mongoose/misfile.model');
const datatable = require('../../api/models/mongoose/datatable.model');
const transactiontable = require('../../api/models/mongoose/transactions.model');
const AWSServices = require('../../api/services/aws');
const { s3keyprefix } = require('../../config/vars');


exports.process = async (options) => {
  if (options.type === 'trans') {
    this.transactionprocessor(options);
  } else if (options.lender === 'federal') {
    await this.fedprocessor(options);
  } else if (options.lender === 'icici') {
    console.log('came for processiong icici');
    await this.iciciprocessor(options);
  } else {
    await this.kvbprocessor(options);
  }
};

exports.fedprocessor = async (options) => {
  try {
    const awsdata = await AWSServices.retrieve({
      key: `${s3keyprefix}/processed/${options.s3key}`,
      bucket: process.env.MIS_BUCKET,
    });
    const directory = await unzipper.Open.buffer(awsdata.Body);
    let count = 0;
    let transformedData;
    await promise.mapSeries(directory.files, async (file) => {
      const extracted = await file.buffer('RUPEEK');
      const data = await converter.csv2jsonAsync(extracted.toString(), {
        trimHeaderFields: true,
        trimFieldValues: true,
      });
      await promise.mapSeries(data, async (datum) => {
        count += 1;
        try {
          transformedData = {
            lenderid: 'federal',
            slno: count,
            branch: datum.BRANCHNAME,
            customername: datum.BORROWER_NAME,
            customerid: datum.CUST_ID,
            loanaccountnumber: datum.LOAN_ACCOUNT_NUMBER,
            sanctionedlimit: datum.SANCTIONED_LIMIT,
            sanctioneddate: datum.SANCTIONED_DATE,
            interestrate: datum.INTEREST_RATE,
            schemecode: datum.SCHEME_CODE,
            schmename: datum.SCEHME_NAME,
            grossweight: datum.GROSS_WEIGHT,
            netweight: datum.NET_WEIGHT,
            phonenumber: datum.CONTACT_NUMBER ? datum.CONTACT_NUMBER.toString().replace(/^91/, '') : '',
            additionalnumber: datum.ADDITIONAL_NUMBER ? datum.ADDITIONAL_NUMBER.toString().replace(/^91/, '') : '',
            oustandingbalance: datum.OUTSTANDING_BALANCE,
            interestamount: datum.INTEREST_AMOUNT,
            penalamount: datum.PENAL_INTEREST_AMOUNT,
            expirydate: datum.EXPIRY_DATE,
            ...(file.path.includes('CLOSED') && {
              closeddate: datum.CLOSURE_DATE,
              closureamount: datum.CLOSED_AMOUNT,
              status: 'Closed',
            }),
            ...(file.path.includes('OUTSTANDING') && {
              status: 'Active',
            }),

          };
          await datatable.updateOne(
            {
              loanaccountnumber: transformedData.loanaccountnumber,
              lenderid: 'federal',
            },
            {
              ...transformedData,
            },
            {
              upsert: true,
            },
          );
        } catch (err) {
          console.log('icici db updation error', err);
        }
      });
    });

    await misfile.updateOne({
      s3key: options.s3key,
      lender: 'federal',
    }, {
      status: 'PROCESSED',
      totalcount: count,
    });
  } catch (err) {
    console.log(' fed file procession error', err);
  }
};

exports.iciciprocessor = async (options) => {
  try {
    const awsdata = await AWSServices.retrieve({
      key: `${s3keyprefix}/processed/${options.s3key}`,
      bucket: process.env.MIS_BUCKET,
    });
    const data = await converter.csv2jsonAsync(awsdata.Body.toString(), {
      trimHeaderFields: true,
      trimFieldValues: true,
    });
    let transformedData;
    let count = 0;
    await promise.mapSeries(data, async (datum) => {
      try {
        count += 1;
        transformedData = {
          lenderid: 'icici',
          slno: count,
          branch: datum.BranchName,
          customername: datum.Customername,
          customerid: datum.CustomerID,
          loanaccountnumber: datum.LoanACno.toString().replace('\'', ''),
          sanctionedlimit: datum.SanctionAmount,
          sanctioneddate: datum.SanctionDate,
          interestrate: datum.InterestRate,
          schemecode: datum.Tenure,
          schmename: datum.SCEHME_NAME,
          grossweight: datum.GrossWeight,
          netweight: datum.NetWeight,
          phonenumber: datum.MobileNumber ? datum.MobileNumber.toString().slice(-10) : '',
          additionalnumber: datum.AltPhNum ? datum.AltPhNum.toString().slice(-10) : '',
          oustandingbalance: datum.CurrentOSasondate,
          interestamount: datum.InterestAmount,
          penalamount: datum.PenalAmount,
          expirydate: datum.ExpiryDate,
          closeddate: datum.CLOSURE_DATE,
          closureamount: datum.ClosureAmountasondate,
          status: datum.Status,
        };
        await datatable.updateOne(
          {
            loanaccountnumber: transformedData.loanaccountnumber,
            lenderid: 'icici',
          },
          {
            ...transformedData,
          },
          {
            upsert: true,
          },
        );
      } catch (err) {
        console.log('icici db updation error', err);
      }
    });
    await misfile.updateOne({
      s3key: options.s3key,
    }, {
      status: 'PROCESSED',
      totalcount: count,
    });
  } catch (err) {
    console.log('icici file processing', err);
  }
};

exports.kvbprocessor = async (options) => {
  try {
    const awsdata = await AWSServices.retrieve({
      key: `${s3keyprefix}/processed/${options.s3key}`,
      bucket: process.env.MIS_BUCKET,
    });
    const misdata = await xls.parse(awsdata.Body);
    const misdatas = (misdata[0].data).slice(3);
    const totalcount = misdatas.length;
    const misconverteddata = [];
    let transformedData;
    await promise.mapSeries(misdatas, async (data) => {
      try {
        transformedData = {
          lenderid: 'kvb',
          slno: data[0],
          loanaccountnumber: data[1],
          branch: data[2],
          sanctioneddate: data[3],
          sanctionedlimit: data[4],
          interestrate: data[5],
          schemecode: data[6],
          schemeduration: data[7],
          schmename: data[8],
          grossweight: data[9],
          netweight: data[10],
          customername: data[11],
          customerid: data[12],
          phonenumber: data[13] ? data[13].toString().slice(-10) : '',
          oustandingbalance: data[14],
          interestamount: data[15],
          penalamount: data[16],
          processingfee: data[17],
          closureamount: data[18],
          repledgeamount: data[19],
          expirydate: data[20],
          status: data[21],
        };
        misconverteddata.push(transformedData);
        await datatable.updateOne(
          {
            loanaccountnumber: transformedData.loanaccountnumber,
            lenderid: 'kvb',
          },
          {
            ...transformedData,
          },
          {
            upsert: true,
          },
        );
      } catch (err) {
        console.log('kvb db updation error', err);
      }
    });
    await misfile.updateOne({
      s3key: options.s3key,
    }, {
      status: 'PROCESSED',
      totalcount,
    });
  } catch (err) {
    console.log('kvb file processing', err);
  }
};

exports.transactionprocessor = async (options) => {
  try {
    const awsdata = await AWSServices.retrieve({
      key: `${s3keyprefix}/processed/${options.s3key}`,
      bucket: process.env.MIS_BUCKET,
    });
    console.log(awsdata);
    const data = await xls.parse(awsdata.Body);
    const exceldata = data[0].data.slice(1);
    console.log('totaldocs', exceldata.length);
    const transactiondata = [];
    let transformedData;
    let count = 0;
    await promise.map(exceldata, async (datum) => {
      try {
        transformedData = {
          lenderid: 'federal',
          loanaccountnumber: datum[0],
          transactiondate: datum[1],
          valuedate: datum[2],
          type: datum[4].toString() === 'C' ? 'CREDITED' : 'DEBITED',
          transactionamount: datum[5],
          particulars: datum[3],
        };
        transactiondata.push(transformedData);
        await transactiontable.create(transformedData);
        count += 1;
      } catch (err) {
        console.log(err);
      }
    });
    await misfile.updateOne({
      s3key: options.s3key,
    }, {
      status: 'PROCESSED',
      totalcount: count,
    });
  } catch (err) {
    console.log('transaction file processing', err);
  }
};
