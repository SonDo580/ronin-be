import { IBookingRepository } from "../../domain/repository/IBookingRepository";
import { BookingRepository } from "../../infrastructure/repository/BookingRepository";

export class BookingService {
  private bookingRepository: IBookingRepository;
  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  book() {}
  history() {}
}
