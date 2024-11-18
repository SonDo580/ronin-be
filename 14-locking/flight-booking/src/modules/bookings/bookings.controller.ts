import { Body, Controller, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDTO } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}

  // Pessimistic Locking
  @Post('/pessimistic')
  async bookSeatPessimistic(@Body() dto: CreateBookingDTO) {
    return this.bookingService.bookSeatPessimistic(dto);
  }

  // Combine Distributed Lock and Optimistic Lock
  @Post('/optimistic-distributed')
  async bookSeatOptimisticDistributed(
    @Body()
    dto: CreateBookingDTO,
  ) {
    return this.bookingService.bookSeatOptimisticDistributed(dto);
  }
}
