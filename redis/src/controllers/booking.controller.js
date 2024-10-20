const bookingService = require("../services/booking.service");

const bookSeat = async (req, res) => {
  const { flightCode, seatCode } = req.body;
  const idempotenceKey = req.headers["Idempotence-Key"];

  // Validate fields
  // ...

  // Check idempotence key
  // ...

  try {
    const result = await bookingService.bookSeat({
      flightCode,
      seatCode,
    });

    if (result.success) {
      res.status(201).json({
        message: `Booking successful for seat ${seatCode} on flight ${flightCode}`,
      });
    } else {
      res.status(423).json({
        message: `Seat ${seatCode} on flight ${flightCode} is locked or already booked`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error occurred during booking",
    });
  }
};

module.exports = {
  bookSeat,
};
