const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || undefined);

const PENDING_EMAIL_CHANGE_PREFIX = 'pendingEmailChange:';
const PENDING_EMAIL_CHANGE_TTL = 10 * 60; // 10 minutes in seconds

async function setPendingEmailChange(userId, data) {
  await redis.set(
    PENDING_EMAIL_CHANGE_PREFIX + userId,
    JSON.stringify(data),
    'EX',
    PENDING_EMAIL_CHANGE_TTL
  );
}

async function getPendingEmailChange(userId) {
  const data = await redis.get(PENDING_EMAIL_CHANGE_PREFIX + userId);
  return data ? JSON.parse(data) : null;
}

async function deletePendingEmailChange(userId) {
  await redis.del(PENDING_EMAIL_CHANGE_PREFIX + userId);
}

module.exports = {
  setPendingEmailChange,
  getPendingEmailChange,
  deletePendingEmailChange,
}; 