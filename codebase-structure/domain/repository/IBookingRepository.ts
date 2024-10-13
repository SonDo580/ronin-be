import { Booking } from "../entity/Booking"

export interface IBookingRepository {
    save(booking: Booking): Promise<Booking>
    find(): Promise<Booking[]>
}