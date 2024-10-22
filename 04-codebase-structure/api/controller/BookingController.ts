import { BookingService } from "../../application/service/BookingService";

export class BookingController {
  private bookingService: BookingService;
  constructor() {
    this.bookingService = new BookingService();
  }

  book() {}
  history() {}
}
