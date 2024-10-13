import { Booking } from "../../domain/entity/Booking";
import { IBookingRepository } from "../../domain/repository/IBookingRepository";

export class BookingRepository implements IBookingRepository {
  async save(booking: Booking) {
    return booking;
  }
  
  async find() {
    return [];
  }
}
