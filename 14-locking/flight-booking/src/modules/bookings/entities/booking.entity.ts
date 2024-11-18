import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum BookingStatus {
  INIT,
  PAID,
  TICKETED,
  DONE,
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'timestamptz' })
  checkout_at: Date;

  @Column({
    type: 'smallint',
    enum: BookingStatus,
    default: BookingStatus.INIT,
  })
  status: number;

  // ... Other fields and relations
}
