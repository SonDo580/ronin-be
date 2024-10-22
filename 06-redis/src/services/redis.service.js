const Redis = require("ioredis");
const { v4: uuidv4 } = require("uuid");

const redisClient = new Redis();
redisClient.on("error", (error) => {
  console.error("Redis error: ", error);
});

const acquireLock = async ({ lockKey, lockTTL = 5000 }) => {
  const lockValue = uuidv4();
  const result = await redisClient.set(lockKey, lockValue, "NX", "PX", lockTTL);
  return result === "OK" ? lockValue : null;
};

const releaseLock = async ({ lockKey, lockValue }) => {
  const currentValue = await redisClient.get(lockKey);
  if (currentValue && currentValue !== lockValue) {
    throw new Error("Lock release failed");
  }
  await redisClient.unlink(lockKey);
};

module.exports = {
  acquireLock,
  releaseLock,
};
