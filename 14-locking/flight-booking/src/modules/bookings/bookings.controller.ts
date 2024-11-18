import { Body, Controller, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDTO } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}

  @Post('/pessimistic')
  async bookSeatPessimistic(@Body() dto: CreateBookingDTO) {
    return this.bookingService.bookSeatPessimistic(dto);
  }

  @Post('/optimistic')
  async bookSeatOptimistic(
    @Body()
    dto: CreateBookingDTO,
  ) {
    return this.bookingService.bookSeatOptimistic(dto);
  }
}
