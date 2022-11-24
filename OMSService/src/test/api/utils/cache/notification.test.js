const NotificationCache = require('../../../../api/utils/cache/notification');
const NotificationService = require('../../../../api/services/notification.service');
const RedisClient = require('../../../../config/redis');

describe('Notification Categories Cache Providers', () => {
  it('if Notification Categories are not present in the cache, will fetch the providers from Notification service', async () => {
    const providers = [{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listCategories').mockReturnValue(providers);
    const response = await NotificationCache.getCategories();
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if Notification Categories  are not present in the cache, will fetch the providers from docsign service, but the providers are not present', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listCategories').mockReturnValue(providers);
    await expect(NotificationCache.getCategories(null, 'random')).rejects.toThrow('Category not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listCategories').mockReturnValue(providers);
    const response = await NotificationCache.getCategories(null, 'object', true);
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if Notification Categories  are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getCategories();
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if specific Notification Category sent as query', async () => {
    const providers = JSON.stringify([{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getCategories('a');
    expect(response).toBe('1');
  });

  it('if specific Notification Category sentas query with type as array', async () => {
    const providers = JSON.stringify([{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getCategories(['name', 'a'], 'array');
    expect(response[0].id).toBe('1');
  });
});

describe('Notification Providers', () => {
  it('if Notification Providers are not present in the cache, will fetch the providers from docsign service', async () => {
    const providers = [{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listProviders').mockReturnValue(providers);
    const response = await NotificationCache.getProviders();
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if Notification Providers are not present in the cache, will fetch the providers from docsign service, but the providers are not present', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listProviders').mockReturnValue(providers);
    await expect(NotificationCache.getProviders(null, 'random')).rejects.toThrow('Provider not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listProviders').mockReturnValue(providers);
    const response = await NotificationCache.getProviders(null, 'object', true);
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if Notification Providers are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getProviders();
    expect(response.a).toBe('1');
    expect(response.b).toBe('2');
  });

  it('if specific Esign provider sent as query', async () => {
    const providers = JSON.stringify([{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getProviders('a');
    expect(response).toBe('1');
  });

  it('if specific Esign provider sent as query with type as array', async () => {
    const providers = JSON.stringify([{ name: 'a', id: '1' }, { name: 'b', id: '2' }, { name: 'c', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getProviders(['name', 'a'], 'array');
    expect(response[0].id).toBe('1');
  });
});

describe('Notification Templates  Cache', () => {
  it('if Notification Templates  are not present in the cache, will fetch the providers from docsign service', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listTemplates').mockReturnValue(providers);
    const response = await NotificationCache.getTemplates();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Notification Templates  are not present in the cache, will fetch the providers from docsign service, but the providers are not present', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listTemplates').mockReturnValue(providers);
    await expect(NotificationCache.getTemplates(null, 'random')).rejects.toThrow('Template not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listTemplates').mockReturnValue(providers);
    const response = await NotificationCache.getTemplates(null, 'object', true);
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Notification Templates  are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getTemplates();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if specific Notification Template sent as query', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getTemplates('type1');
    expect(response).toBe('1');
  });

  it('if specific Notification Template as query sent with type as array', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getTemplates(['name', 'type1'], 'array');
    expect(response[0].id).toBe('1');
  });
});

describe('Notification Types Cache', () => {
  it('if Notification Types are not present in the cache, will fetch the providers from docsign service', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listTypes').mockReturnValue(providers);
    const response = await NotificationCache.getTypes();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Notification Types are not present in the cache, will fetch the providers from docsign service, but the providers are not present', async () => {
    const providers = null;
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listTypes').mockReturnValue(providers);
    await expect(NotificationCache.getTypes(null, 'random')).rejects.toThrow('Type not found. Query: null, type: random, invalidate: false');
  });

  it('if invalidate is true', async () => {
    const providers = [{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }];
    jest.spyOn(RedisClient, 'delAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(null);
    jest.spyOn(RedisClient, 'setAsync').mockReturnValue(null);
    jest.spyOn(NotificationService, 'listTypes').mockReturnValue(providers);
    const response = await NotificationCache.getTypes(null, 'object', true);
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if Notification Types are present in the cache', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getTypes();
    expect(response.type1).toBe('1');
    expect(response.type2).toBe('2');
  });

  it('if specific Notification Type sent as query', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getTypes('type1');
    expect(response).toBe('1');
  });

  it('if specific Notification Type sent as query with type as array', async () => {
    const providers = JSON.stringify([{ name: 'type1', id: '1' }, { name: 'type2', id: '2' }, { name: 'type3', id: '3' }]);
    jest.spyOn(RedisClient, 'getAsync').mockReturnValue(providers);
    const response = await NotificationCache.getTypes(['name', 'type1'], 'array');
    expect(response[0].id).toBe('1');
  });
});
