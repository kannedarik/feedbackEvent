const {
  isEmpty, map, groupBy,
} = require('lodash');
const axios = require('axios');
const { services } = require('../../config/vars');
const { logger } = require('../../config/logger');

exports.getBranchByCoreID = async (coreBranchID) => {
  const options = {
    url: `${services.lendingMDS.endpoint}${services.lendingMDS.getBranchByCoreID}/${coreBranchID}`,
    method: 'GET',
    auth: {
      username: services.lendingMDS.username,
      password: services.lendingMDS.password,
    },
  };

  const { data: response } = await axios(options);
  return response.data;
};

const getLendersbranchinfo = async (params) => {
  const options = {
    url: `${services.lendingMDS.endpoint}${services.lendingMDS.getBranchByCoreID}`,
    method: 'GET',
    auth: {
      username: services.lendingMDS.username,
      password: services.lendingMDS.password,
    },
    params: {
      pageNumber: (params && params.pageNumber) ? params.pageNumber : 0,
      pageSize: (params && params.pageSize) ? params.pageSize : 1000,
    },
  };
  const response = await axios(options);
  return response.data;
};

exports.getLenders = async () => {
  let branches = [];
  let pageNo = 0;
  let nextPage = true;
  try {
    while (nextPage) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getLendersbranchinfo({ pageNumber: pageNo, pageSize: 1000 });
      pageNo += 1;
      if (isEmpty(response) || isEmpty(response.data) || (pageNo >= response.totalPages)) {
        nextPage = false;
      }
      if (!isEmpty(response) && !isEmpty(response.data)) branches = [...branches, ...response.data];
    }
  } catch (e) {
    if (!isEmpty(branches)) {
      logger.info('page limit exceeded');
    } else {
      logger.error('some error occured while fetching lender info', e);
    }
  }
  const gbBylendingPartners = groupBy(branches, 'lendingPartner.coreId');
  const lenderbranchList = map(gbBylendingPartners, (lendingbranches, lender) => ({
    id: gbBylendingPartners[lender][0].lendingPartner.coreId,
    name: gbBylendingPartners[lender][0].lendingPartner.lenderName,
    slug: gbBylendingPartners[lender][0].lendingPartner.slug,
    branches: map(lendingbranches, (branch) => ({
      branchname: branch.branchName,
      id: branch.coreId,
      branchof: branch.lendingPartner.coreId,
      emails: branch.contactMails,
      cityid: branch.address.cityId,
      address: branch.address.street,
      locality: branch.address.locality,
      location: branch.address.location,
      city: branch.address.cityName,
      pincode: branch.address.pincode,
    })),
  }));
  return lenderbranchList;
};

exports.getBranchHolidayData = async (params, lenderSlug = 'federal') => {
  const options = {
    url: `${services.lendingMDS.endpoint}/api/v1/${lenderSlug}/branchHoliday`,
    method: 'GET',
    auth: {
      username: services.lendingMDS.username,
      password: services.lendingMDS.password,
    },
    params,
  };
  const response = await axios(options);
  return response.data;
};
