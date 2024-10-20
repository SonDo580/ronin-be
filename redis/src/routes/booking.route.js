const express = require("express");
const bookingController = require("../controllers/booking.controller");

const router = express.Router();

// add protect middleware (check access token)
// ...

// Route for booking a seat on a flight
router.post("/", bookingController.bookSeat);

module.exports = router;
