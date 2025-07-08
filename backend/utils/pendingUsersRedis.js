const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || undefined);

const PENDING_USER_PREFIX = 'pendingUser:';
const PENDING_USER_TTL = 10 * 60; // 10 minutes in seconds

async function setPendingUser(email, data) {
  await redis.set(
    PENDING_USER_PREFIX + email,
    JSON.stringify(data),
    'EX',
    PENDING_USER_TTL
  );
}

async function getPendingUser(email) {
  const data = await redis.get(PENDING_USER_PREFIX + email);
  return data ? JSON.parse(data) : null;
}

async function deletePendingUser(email) {
  await redis.del(PENDING_USER_PREFIX + email);
}

module.exports = {
  setPendingUser,
  getPendingUser,
  deletePendingUser,
}; 