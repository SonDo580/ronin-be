import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { DataSource } from 'typeorm';
import {
  SeatAvailability,
  SeatAvailabilityStatus,
} from '../seats/entities/seat-availability.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { RedisService } from '../redis/redis.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Note:
// - should use separate database and redis instances for testing
// - run database and redis: docker compose up
// - start the application: npm run start:dev

describe('BookingsService Integration Tests', () => {
  let bookingsService: BookingsService;
  let dataSource: DataSource;
  let redisService: RedisService;

  // Sample payload
  const bookingPayload = {
    flightId: 1,
    seatCode: '21A',
  };

  // Helper function to create test data
  const createSeatAvailability = async ({
    flightId = bookingPayload.flightId,
    seatCode = bookingPayload.seatCode,
    price = 100,
    status,
  }: {
    flightId?: number;
    seatCode?: string;
    price?: number;
    status: SeatAvailabilityStatus;
  }) => {
    const seatRepository = dataSource.getRepository(SeatAvailability);

    const seat = new SeatAvailability();
    seat.flight_id = flightId;
    seat.seat_code = seatCode;
    seat.status = status;
    seat.price = price;

    return await seatRepository.save(seat);
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService, RedisService, DataSource],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
    redisService = module.get<RedisService>(RedisService);
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await dataSource.getRepository(SeatAvailability).clear();
    await dataSource.getRepository(Booking).clear();
  });

  afterAll(async () => {
    // Clean up the database after all tests have finished
    await dataSource.getRepository(SeatAvailability).clear();
    await dataSource.getRepository(Booking).clear();
  });

  describe('Test booking with pessimistic locking', () => {
    it('The seat does not exist', async () => {
      await expect(
        bookingsService.bookSeatPessimistic(bookingPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('The seat is already reserved', async () => {
      // Create a reserved seat
      await createSeatAvailability({ status: SeatAvailabilityStatus.RESERVED });

      await expect(
        bookingsService.bookSeatPessimistic(bookingPayload),
      ).rejects.toThrow(ConflictException);
    });

    it('Reserve the seat and create a booking successfully', async () => {
      // Create an available seat
      await createSeatAvailability({
        status: SeatAvailabilityStatus.AVAILABLE,
      });

      const result = await bookingsService.bookSeatPessimistic(bookingPayload);

      // Check if a booking was created
      const booking = await dataSource
        .getRepository(Booking)
        .findOneBy({ id: result.bookingId });

      expect(booking).toBeDefined();
      expect(booking.status).toBe(BookingStatus.INIT);

      // Check if the seat status has been updated
      const updatedSeat = await dataSource
        .getRepository(SeatAvailability)
        .findOneBy({
          flight_id: bookingPayload.flightId,
          seat_code: bookingPayload.seatCode,
        });

      expect(updatedSeat.status).toBe(SeatAvailabilityStatus.RESERVED);
    });

    it('Handle pessimistic write locks correctly', async () => {
      // Create an available seat
      await createSeatAvailability({
        status: SeatAvailabilityStatus.AVAILABLE,
      });

      // Simulate 2 requests trying to lock the same seat
      const [result1, result2] = await Promise.allSettled([
        bookingsService.bookSeatPessimistic(bookingPayload),
        bookingsService.bookSeatPessimistic(bookingPayload),
      ]);

      // Assert: 1 request succeeds, the other fails with a ConflictException
      const fulfilled = [result1, result2].find(
        (result) => result.status === 'fulfilled',
      );
      const rejected = [result1, result2].find(
        (result) => result.status === 'rejected',
      );

      expect(fulfilled).toBeDefined(); // Ensure one request succeeded
      expect(rejected).toBeDefined(); // Ensure one request failed
      // expect(rejected.reason).toBeInstanceOf(ConflictException);
    });
  });
});
