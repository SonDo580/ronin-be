import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateBookingDTO } from './dto/create-booking.dto';
import {
  SeatAvailability,
  SeatAvailabilityStatus,
} from '../seats/entities/seat-availability.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { ErrorCode } from 'src/constants/error-code';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  // Pessimistic Locking
  async bookSeatPessimistic({ flightId, seatCode }: CreateBookingDTO) {
    return this.dataSource.transaction(async (manager) => {
      // Lock the row using a pessimistic write lock
      // (SELECT ... FOR UPDATE)
      const seatAvailability = await manager
        .getRepository(SeatAvailability)
        .createQueryBuilder('seat_availability')
        .setLock('pessimistic_write') // <=
        .where('seat_availability.flight_id = :flightId', { flightId })
        .andWhere('seat_availability.seat_code = :seatCode', { seatCode })
        .getOne();

      // Check seat existence
      if (!seatAvailability) {
        throw new NotFoundException(ErrorCode.SEAT_NOT_FOUND);
      }

      // Check seat status
      if (seatAvailability.status !== SeatAvailabilityStatus.AVAILABLE) {
        throw new ConflictException(ErrorCode.SEAT_NOT_AVAILABLE);
      }

      // Update the seat status
      seatAvailability.status = SeatAvailabilityStatus.RESERVED;

      // Create booking
      const booking = manager.create(Booking, {
        total_amount: seatAvailability.price, // simplified, there are other amounts
        checkout_at: new Date(),
        status: BookingStatus.INIT,
      });

      await Promise.all([
        manager.save(seatAvailability),
        manager.save(booking),
      ]);

      return { bookingId: booking.id };
    });
  }

  // Combine Distributed Lock and Optimistic Lock
  async bookSeatOptimisticDistributed({
    flightId,
    seatCode,
  }: CreateBookingDTO) {
    const resource = `seat_lock:${flightId}:${seatCode}`;

    // Attempt to acquire the distributed lock
    const lock = await this.redisService.acquireLock(resource);
    if (!lock) {
      throw new ConflictException(ErrorCode.SEAT_BEING_BOOKED_BY_OTHER_REQUEST);
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const seatAvailabilityRepository =
          manager.getRepository(SeatAvailability);
        const bookingRepository = manager.getRepository(Booking);

        // Fetch the seat availability
        const seatAvailability = await seatAvailabilityRepository.findOne({
          where: { flight_id: flightId, seat_code: seatCode },
        });

        // Check seat existence
        if (!seatAvailability) {
          throw new NotFoundException(ErrorCode.SEAT_NOT_FOUND);
        }

        // Check seat status
        if (seatAvailability.status !== SeatAvailabilityStatus.AVAILABLE) {
          throw new ConflictException(ErrorCode.SEAT_NOT_AVAILABLE);
        }

        // Attempt to update the seat,
        // with version check for optimistic locking
        const result = await seatAvailabilityRepository.update(
          {
            flight_id: flightId,
            seat_code: seatCode,
            version: seatAvailability.version,
          },
          {
            status: SeatAvailabilityStatus.RESERVED,
            version: seatAvailability.version + 1,
          },
        );

        // Check if the seat was updated by another transaction
        // => Retry OR throw and let client retry
        if (result.affected === 0) {
          throw new ConflictException(
            ErrorCode.SEAT_UPDATED_BY_OTHER_TRANSACTION,
          );
        }

        // Create the booking
        const booking = bookingRepository.create({
          total_amount: seatAvailability.price, // simplified, there are other amounts
          checkout_at: new Date(),
          status: BookingStatus.INIT,
        });

        await bookingRepository.save(booking);
        return { bookingId: booking.id };
      });
    } finally {
      // Release the distributed lock after processing the request
      await this.redisService.releaseLock(lock);
    }
  }
}
