/* eslint-disable max-len */
// /* eslint-disable max-len */
// /* eslint-disable no-nested-ternary */
// const { find, filter, map } = require('lodash');
// const RedisClient = require('../../config/redis');
// const RupeekService = require('../services/rupeek');
// const { redis } = require('../../config/vars');

// const getStates = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.states);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.states);
//   let states = JSON.parse(cachedData);

//   if (!states) {
//     states = await RupeekService.states();
//     await RedisClient.setAsync(redis.key.states, JSON.stringify(states), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(states, query) : filter(states, query) : states;
//   if (response) {
//     return response;
//   }
//   throw new Error(`State not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getCities = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.cities);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.cities);
//   let cities = JSON.parse(cachedData);

//   if (!cities) {
//     cities = await RupeekService.cities();
//     await RedisClient.setAsync(redis.key.cities, JSON.stringify(cities), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(cities, query) : filter(cities, query) : cities;
//   if (response) {
//     return response;
//   }
//   throw new Error(`City not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getCategories = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.categories);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.categories);
//   let categories = JSON.parse(cachedData);

//   if (!categories) {
//     categories = await RupeekService.categories();
//     await RedisClient.setAsync(redis.key.categories, JSON.stringify(categories), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(categories, query) : filter(categories, query) : categories;
//   if (response) {
//     return response;
//   }
//   throw new Error(`Category not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getLenders = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.lenders);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.lenders);
//   let lenders = JSON.parse(cachedData);

//   if (!lenders) {
//     lenders = await RupeekService.lenders();
//     await RedisClient.setAsync(redis.key.lenders, JSON.stringify(lenders), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(lenders, query) : filter(lenders, query) : lenders;
//   if (response) {
//     return response;
//   }
//   throw new Error(`Lender not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getLenderBranches = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.lenderbranches);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.lenderbranches);
//   let lenderbranches = JSON.parse(cachedData);

//   if (!lenderbranches) {
//     lenderbranches = await RupeekService.lenderbranches();
//     await RedisClient.setAsync(redis.key.lenderbranches, JSON.stringify(lenderbranches), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(lenderbranches, query) : filter(lenderbranches, query) : lenderbranches;
//   if (response) {
//     return response;
//   }
//   throw new Error(`LenderBranch not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getSchemes = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.schemes);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.schemes);
//   let schemes = JSON.parse(cachedData);

//   if (!schemes) {
//     schemes = await RupeekService.schemes();
//     await RedisClient.setAsync(redis.key.schemes, JSON.stringify(schemes), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(schemes, query) : filter(schemes, query) : schemes;
//   if (response) {
//     return response;
//   }
//   throw new Error(`Scheme not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getGoldSchemes = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.goldschemes);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.goldschemes);
//   let goldschemes = JSON.parse(cachedData);

//   if (!goldschemes) {
//     goldschemes = await RupeekService.goldschemes();
//     await RedisClient.setAsync(redis.key.goldschemes, JSON.stringify(goldschemes), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(goldschemes, query) : filter(goldschemes, query) : goldschemes;
//   if (response) {
//     return response;
//   }
//   throw new Error(`GoldScheme not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// const getUnsecuredSchemes = async (query, justOne = false, invalidate = false) => {
//   if (invalidate) {
//     await RedisClient.delAsync(redis.key.unsecureschemes);
//   }

//   const cachedData = await RedisClient.getAsync(redis.key.unsecureschemes);
//   let unsecureschemes = JSON.parse(cachedData);

//   if (!unsecureschemes) {
//     unsecureschemes = await RupeekService.unsecureschemes();
//     await RedisClient.setAsync(redis.key.unsecureschemes, JSON.stringify(unsecureschemes), 'EX', redis.expiry.masterdb);
//   }

//   const response = query ? justOne ? find(unsecureschemes, query) : filter(unsecureschemes, query) : unsecureschemes;
//   if (response) {
//     return response;
//   }
//   throw new Error(`UnsecuredScheme not found. Query: ${JSON.stringify(query)}, justOne: ${justOne}, invalidate: ${invalidate}`);
// };

// exports.copyMasterDB = async (invalidate = false) => {
//   try {
//     await Promise.all([
//       getStates(null, invalidate),
//       getCities(null, invalidate),
//       getCategories(null, invalidate),
//       getLenders(null, invalidate),
//       getLenderBranches(null, invalidate),
//       getSchemes(null, invalidate),
//       getGoldSchemes(null, invalidate),
//       getUnsecuredSchemes(null, invalidate),
//     ]);
//   } catch (err) {
//     throw new Error('Redis catching for master DB failed');
//   }
// };

// exports.getCategories = getCategories;
// exports.getLenders = getLenders;
// exports.getLenderBranches = getLenderBranches;

// exports.getLender = async (id, populate = false) => {
//   const [lender, branches, schemes, goldschemes, unsecuredschemes] = await Promise.all([
//     getLenders({ id }, true),
//     ...(populate ? [getLenderBranches({ branchof: id })] : []),
//     ...(populate ? [getSchemes({ lender: id })] : []),
//     ...(populate ? [getGoldSchemes()] : []),
//     ...(populate ? [getUnsecuredSchemes()] : []),
//   ]);

//   return {
//     ...lender,
//     ...(populate && { branches }),
//     ...(populate && {
//       schemes: map(schemes, scheme => ({
//         ...scheme,
//         ...(scheme.goldscheme && { goldscheme: find(goldschemes, { id: scheme.goldscheme }) }),
//         ...(scheme.unsecurescheme && { unsecurescheme: find(unsecuredschemes, { id: scheme.unsecurescheme }) }),
//       })),
//     }),
//   };
// };

// exports.getScheme = async (id, populate = false) => {
//   const [scheme, goldschemes, unsecuredschemes] = await Promise.all([
//     getSchemes({ id }, true),
//     ...(populate ? [getGoldSchemes()] : []),
//     ...(populate ? [getUnsecuredSchemes()] : []),
//   ]);

//   return {
//     ...scheme,
//     ...(populate && { goldscheme: find(goldschemes, { id: scheme.goldscheme }) }),
//     ...(populate && { unsecurescheme: find(unsecuredschemes, { id: scheme.unsecurescheme }) }),
//   };
// };
