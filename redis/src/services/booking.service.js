const redisService = require("./redis.service");

const bookSeat = async ({ flightCode, seatCode }) => {
  // Check if the seat is already booked
  // ...

  const lockKey = `flight-${flightCode}:seat-${seatCode}`;

  // acquire the lock
  const lockValue = await redisService.acquireLock({ lockKey });
  if (!lockValue) {
    return { success: false };
  }

  // simulate booking success
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });

  // release the lock
  await redisService.releaseLock({ lockKey, lockValue });
  return { success: true };
};

module.exports = {
  bookSeat,
};
