/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../../../config/logger');

const NotificationCache = require('../cache/notification');
const { loantype, lenderNameMapping, interest } = require('../constants.js');

const hasNewUnsecureloan = (orderItem) => (orderItem.meta.newloantype === loantype.NON_KGL
   && orderItem.meta.newunsecureamount > 0);

const getBaseSchemes = (baseScheme, type) => _.find(baseScheme, { type });

const isJumpingScheme = (scheme) => {
  const isAddOnJumping = !_.isEmpty(_.find(scheme.addons,
    { type: interest.calculationType.jumping }));
  return (isAddOnJumping
    || scheme.interestCalculation.type === interest.calculationType.jumping);
};

const fetchNumberOfSlabs = (scheme) => {
  if (isJumpingScheme(scheme)) {
    const noOfSlabs = _.isEmpty(scheme.addons)
      ? _.size(scheme.interestCalculation.interestSlabs)
      : _.size(scheme.addons[0].interestSlabs);
    return noOfSlabs;
  }
  return 0;
};

const fetchMaxNumberOfSlabs = (baseSchemes) => {
  const secureScheme = getBaseSchemes(baseSchemes, loantype.secure);
  const unsecureScheme = getBaseSchemes(baseSchemes, loantype.unsecure);
  if (_.isEmpty(unsecureScheme)) {
    return fetchNumberOfSlabs(secureScheme);
  }
  return Math.max(fetchNumberOfSlabs(secureScheme), fetchNumberOfSlabs(unsecureScheme));
};

const formMonthlyTemplateData = async (orderItem) => {
  const { newscheme } = orderItem.meta;
  const monthlyInterestRate = (newscheme.interestCalculation.interestRate / 12) / 100;
  const yearlyInterestRate = newscheme.interestCalculation.interestRate;
  const securePfText = setPfChargeText(orderItem.meta.newsecurecharges);
  return { monthlyInterestRate, yearlyInterestRate, securePfText };
};

const setJumpingText = (scheme, maxNummberOfSlabs) => {
  let interestSlabs = null;
  let baseRate = null;
  if (scheme.interestCalculation.type === interest.calculationType.jumping) {
    if (!_.isEmpty(scheme.addons)) {
      throw new Error('addons must be empty for jumping base scheme');
    }
    // baseScheme: Jumping; AddOn: Empty
    interestSlabs = scheme.interestCalculation.interestSlabs;
    baseRate = interestSlabs[_.size(interestSlabs) - 1].interestRate;
  } else {
    // baseScheme: Flat; AddOn: Jumping
    interestSlabs = scheme.addons[0].interestSlabs;
    baseRate = scheme.interestCalculation.interestRate;
  }

  let jumpingText = '';
  // logic to make number of slabs in secure
  // and unsecure components in jumpingText equal
  _.times(maxNummberOfSlabs - fetchNumberOfSlabs(scheme), () => {
    jumpingText += 'in every ';
    jumpingText += interestSlabs[0].toDay;
    jumpingText += ' days: ';
    jumpingText += interestSlabs[0].interestRate;
    jumpingText += '% after eligible rebate of ';
    jumpingText += Math.max(0,
      (Math.round((baseRate - interestSlabs[0].interestRate) * 100.0) / 100.0));
    jumpingText += '%\n';
  });

  // logic to generate jumpingText
  let iter = 1;
  _.map(interestSlabs, (slab) => {
    if (iter === _.size(interestSlabs)) {
      jumpingText += 'once at ';
    } else {
      jumpingText += 'in every ';
    }
    jumpingText += slab.toDay;
    jumpingText += ' days: ';
    jumpingText += Math.round(slab.interestRate * 100) / 100;
    jumpingText += '% after eligible rebate of ';
    jumpingText += Math.max(0,
      Math.round((baseRate - slab.interestRate) * 100) / 100);
    jumpingText += '%\n';
    iter += 1;
  });
  return jumpingText;
};

const setFlatText = (scheme) => {
  const { addons } = scheme;
  let flatText = '';
  if (_.isEmpty(addons)) {
    // baseScheme: Flat; AddOn: Empty
    flatText += Math.round(scheme.interestCalculation.interestRate * 100) / 100;
    flatText += '% after eligible rebate of 0%\n';
  } else {
    // baseScheme: Flat; AddOn: Flat
    flatText += addons[0].interestRate;
    flatText += '% after eligible rebate of ';
    flatText += Math.max(0,
      (Math.round((scheme.interestCalculation.interestRate - addons[0].interestRate) * 100) / 100));
    flatText += '%\n';
  }
  return flatText;
};

const setSecureBaseRateText = (scheme) => {
  let baseRateText = '';
  let baseRate;
  if (scheme.interestCalculation.type === interest.calculationType.jumping) {
    // baseScheme: Jumping;
    const { interestSlabs } = scheme.interestCalculation;
    baseRate = interestSlabs[_.size(interestSlabs) - 1].interestRate;
  } else {
    // baseScheme: Flat
    baseRate = scheme.interestCalculation.interestRate;
  }
  const isSimple = scheme.interestCalculation.interestType === interest.type.simple;
  baseRateText += Math.round(baseRate * 100) / 100;
  baseRateText += '% p.a. ';
  baseRateText += (isSimple ? interest.type.simple : interest.type.compounding);
  return baseRateText;
};

const setUnsecureBaseRateText = (unsecureScheme, tenure) => {
  const { interestRate } = unsecureScheme.interestCalculation;
  const baseRate = (((1 + ((interestRate * tenure) / 1200)) ** (1.0 / tenure)) - 1) * 1200;
  let baseRateText = '';
  baseRateText += Math.round(baseRate * 100) / 100;
  baseRateText += '% p.a. compounding';
  return baseRateText;
};

const setPfChargeText = (charges) => {
  let pfText = 'INR 0';
  if (_.isEmpty(charges)) {
    return pfText;
  }
  const chargeAmount = _.sumBy(charges, 'chargeAmount');
  const taxAmount = _.sumBy(charges, 'taxAmount');
  if (chargeAmount > 0) {
    pfText = 'INR ';
    pfText += chargeAmount;
    pfText += ' + INR ';
    pfText += (taxAmount || 0);
  }
  return pfText;
};

const fetchTemplateName = (templateData, schemeDetails) => {
  let templateName = '';
  if (schemeDetails.interestCalculation.type === interest.calculationType.monthly) {
    templateName += 'Monthly';
  } else {
    templateName += templateData.secureJumpingText
      ? 'Jumping' : 'Flat';
  }
  templateName += templateData.unsecureBaseRateText ? 'Unsecure' : 'Secure';
  templateName += 'LoanSMS';
  return templateName;
};

exports.loanAmountDeclarationSMSTemplate = async (orderItem) => {
  try {
    const {
      newsecureamount, newunsecureamount, lender, eligibleweight,
    } = orderItem.meta;
    const data = {
      securedLoanAmount: newsecureamount,
      lenderName: lenderNameMapping[lender],
      totalJewelWeight: eligibleweight,
      ...(hasNewUnsecureloan(orderItem) && {
        unsecuredLoanAmount: newunsecureamount,
      }),
    };
    const templateName = `${hasNewUnsecureloan(orderItem) ? 'Unsecure' : 'Secure'}LoanSMS`;
    const id = await NotificationCache.getTemplates(templateName);
    return { id, data };
  } catch (err) {
    logger.error('error in generating first sms template', err);
    return {};
  }
};

exports.loanInterestDeclarationSMSTemplate = async (orderItem) => {
  try {
    let templateData = {};
    const { newscheme: schemeDetails, newunsecureamount } = orderItem.meta;
    const { baseSchemes } = schemeDetails;
    const secureScheme = getBaseSchemes(baseSchemes, loantype.secure);
    const unsecureScheme = getBaseSchemes(baseSchemes, loantype.unsecure);
    if (schemeDetails.interestCalculation.type === interest.calculationType.monthly) {
      templateData = formMonthlyTemplateData(orderItem);
    } else {
      if (!_.isEmpty(unsecureScheme)
      && isJumpingScheme(secureScheme) !== isJumpingScheme(unsecureScheme)) {
        throw new Error('both scheme and unsecure should not be different');
      }
      // assuming that both secure and unsecure component will be jumping
      // if one of them is jumping
      if (isJumpingScheme(secureScheme)) {
        const maxNummberOfSlabs = fetchMaxNumberOfSlabs(baseSchemes);
        templateData.secureJumpingText = setJumpingText(secureScheme, maxNummberOfSlabs);
        if (newunsecureamount > 0 && !_.isEmpty(unsecureScheme)) {
          templateData.unsecureJumpingText = setJumpingText(unsecureScheme, maxNummberOfSlabs);
        }
      } else {
        templateData.secureFlatText = setFlatText(secureScheme);
        if (newunsecureamount > 0 && !_.isEmpty(unsecureScheme)) {
          templateData.unsecureFlatText = setFlatText(unsecureScheme);
        }
      }
      templateData.secureBaseRateText = setSecureBaseRateText(secureScheme);
      templateData.securePfText = setPfChargeText(orderItem.meta.newsecurecharges);
      if (newunsecureamount > 0 && !_.isEmpty(unsecureScheme)) {
        templateData.unsecureBaseRateText = setUnsecureBaseRateText(
          unsecureScheme,
          schemeDetails.tenure,
        );
        templateData.unsecurePfText = setPfChargeText(orderItem.meta.newunsecurecharges);
      }
    }
    const templateName = fetchTemplateName(templateData, schemeDetails);
    const templateId = await NotificationCache.getTemplates(templateName);
    return { data: templateData, id: templateId };
  } catch (err) {
    logger.error('error in generating second sms template', err);
    return {};
  }
};
