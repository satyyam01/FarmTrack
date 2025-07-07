const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || undefined);

async function getCache(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCache(key, value, ttlSeconds = 60) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function delCache(key) {
  await redis.del(key);
}

module.exports = {
  getCache,
  setCache,
  delCache,
};