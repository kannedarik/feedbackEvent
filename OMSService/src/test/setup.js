/**
 * Jest will replace usage of `redis` with `redis-mock`
 *
 * Refer: https://github.com/yeahoffline/redis-mock#jest
 */
jest.mock('redis', () => jest.requireActual('redis-mock'));
