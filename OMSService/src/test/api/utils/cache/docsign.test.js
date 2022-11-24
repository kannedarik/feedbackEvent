const DocsignCache = require('../../../../api/utils/cache/docsign');
const DocSignService = require('../../../../api/services/docsign.service');
const RedisClient = require('../../../../config/redis');

describe('Digital Sign Cache Providers', () => {
  it('if digital providers are not present in the cache', async () => {
    const providers = [{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listDigiSignProviders').mockReturnValue(providers);
    const response = await DocsignCache.getDigitSignProviders();
    expect(response.provider1).toBe('1');
    expect(response.provider2).toBe('2');
  });

  it('if digital providers are not present in the cache, and expected to throw error as type is no valid', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listDigiSignProviders').mockReturnValue(providers);
    await expect(DocsignCache.getDigitSignProviders(null, 'random')).rejects.toThrow('DigiSignProvider not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listDigiSignProviders').mockReturnValue(providers);
    const response = await DocsignCache.getDigitSignProviders(null, 'object', true);
    expect(response.provider1).toBe('1');
    expect(response.provider2).toBe('2');
  });

  it('if digital providers are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getDigitSignProviders();
    expect(response.provider1).toBe('1');
    expect(response.provider2).toBe('2');
  });

  it('if specific digital provider sent as query', async () => {
    const providers = JSON.stringify([{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getDigitSignProviders('provider1');
    expect(response).toBe('1');
  });

  it('if specific digital provider sent with type as array', async () => {
    const providers = JSON.stringify([{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getDigitSignProviders(['name', 'provider1'], 'array');
    expect(response[0].id).toBe('1');
  });
});

describe('Esign Cache Providers', () => {
  it('if Esign providers are not present in the cache', async () => {
    const providers = [{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listESignProviders').mockReturnValue(providers);
    const response = await DocsignCache.getESignProviders();
    expect(response.provider1).toBe('1');
    expect(response.provider2).toBe('2');
  });

  it('if Esign providers are not present in the cache, and expected to throw error as type is no valid', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listESignProviders').mockReturnValue(providers);
    await expect(DocsignCache.getESignProviders(null, 'random')).rejects.toThrow('ESignProvider not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listESignProviders').mockReturnValue(providers);
    const response = await DocsignCache.getESignProviders(null, 'object', true);
    expect(response.provider1).toBe('1');
    expect(response.provider2).toBe('2');
  });

  it('if Esign providers are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getESignProviders();
    expect(response.provider1).toBe('1');
    expect(response.provider2).toBe('2');
  });

  it('if specific Esign provider sent as query', async () => {
    const providers = JSON.stringify([{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getESignProviders('provider1');
    expect(response).toBe('1');
  });

  it('if specific Esign provider sent with type as array', async () => {
    const providers = JSON.stringify([{ name: 'provider1', id: '1' }, { name: 'provider2', id: '2' }, { name: 'provider3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getESignProviders(['name', 'provider1'], 'array');
    expect(response[0].id).toBe('1');
  });
});

describe('Sign Types Cache', () => {
  it('if Sign Types are not present in the cache', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listTypes').mockReturnValue(providers);
    const response = await DocsignCache.getTypes();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Sign Types are not present in the cache, and expected to throw error as type is no valid', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listTypes').mockReturnValue(providers);
    await expect(DocsignCache.getTypes(null, 'random')).rejects.toThrow('SignType not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(DocSignService, 'listTypes').mockReturnValue(providers);
    const response = await DocsignCache.getTypes(null, 'object', true);
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Sign Types are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getTypes();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if specific Sign Type sent as query', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getTypes('type1');
    expect(response).toBe('1');
  });

  it('if specific Sign Type sent as query with type as array', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await DocsignCache.getTypes(['name', 'type1'], 'array');
    expect(response[0].id).toBe('1');
  });
});
