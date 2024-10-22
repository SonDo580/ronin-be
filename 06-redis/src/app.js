const express = require("express");
const bookingRouter = require('./routes/booking.route');

const app = express();
app.use(express.json());
app.use("/api/bookings", bookingRouter);

const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
