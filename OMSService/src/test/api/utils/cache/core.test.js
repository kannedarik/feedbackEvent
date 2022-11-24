const CoreCache = require('../../../../api/utils/cache/core');
const LendingMDSService = require('../../../../api/services/lendingMDS.service');
const MasterDataService = require('../../../../api/services/masterdata.service');
const RedisClient = require('../../../../config/redis');

describe('Core Lenders Cache Providers', () => {
  it('if Core Lenders are not present in the cache', async () => {
    const providers = [{ slug: 'a', id: '1' }, { slug: 'b', id: '2' }, { slug: 'c', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(LendingMDSService, 'getLenders').mockReturnValue(providers);
    const response = await CoreCache.getLenders();
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if Core Lenders are not present in the cache, and expected to throw error as type is no valid', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(LendingMDSService, 'getLenders').mockReturnValue(providers);
    await expect(CoreCache.getLenders(null, 'random')).rejects.toThrow('Lender not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ slug: 'a', id: '1' }, { slug: 'b', id: '2' }, { slug: 'c', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(LendingMDSService, 'getLenders').mockReturnValue(providers);
    const response = await CoreCache.getLenders(null, 'object', true);
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if Core Lenders  are present in the cache', async () => {
    const providers = JSON.stringify([{ slug: 'a', id: '1' }, { slug: 'b', id: '2' }, { slug: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await CoreCache.getLenders();
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if specific Core Lender sent as query', async () => {
    const providers = JSON.stringify([{ slug: 'a', id: '1' }, { slug: 'b', id: '2' }, { slug: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await CoreCache.getLenders('a');
    expect(response).toBe('1');
  });

  it('if specific Core Lender sent as query with type as array', async () => {
    const providers = JSON.stringify([{ slug: 'a', id: '1' }, { slug: 'b', id: '2' }, { slug: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await CoreCache.getLenders(['slug', 'a'], 'array');
    expect(response[0].id).toBe('1');
  });
});

describe('Cities Cache', () => {
  it('if Cities are not present in the cache', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(MasterDataService, 'getCities').mockReturnValue(providers);
    const response = await CoreCache.getCities();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Cities are not present in the cache, and expected to throw error as type is no valid', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(MasterDataService, 'getCities').mockReturnValue(providers);
    await expect(CoreCache.getCities(null, 'random')).rejects.toThrow('City not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(MasterDataService, 'getCities').mockReturnValue(providers);
    const response = await CoreCache.getCities(null, 'object', true);
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Cities are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await CoreCache.getCities();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if specific City sent as query', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await CoreCache.getCities('type1');
    expect(response).toBe('1');
  });

  it('if specific City sent as query with type as array', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await CoreCache.getCities(['name', 'type1'], 'array');
    expect(response[0].id).toBe('1');
  });
});
