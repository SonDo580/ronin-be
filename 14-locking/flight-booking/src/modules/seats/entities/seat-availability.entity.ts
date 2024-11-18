import { Column, Entity, PrimaryColumn, VersionColumn } from 'typeorm';

export enum SeatAvailabilityStatus {
  AVAILABLE,
  RESERVED,
}

@Entity('seat_availability')
export class SeatAvailability {
  @PrimaryColumn()
  flight_id: number;

  @PrimaryColumn()
  seat_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'smallint',
    enum: SeatAvailabilityStatus,
    default: SeatAvailabilityStatus.AVAILABLE,
  })
  status: number;

  @Column({
    type: 'bigint',
    default: 0,
  })
  version: number;
  // Note that there's a VersionColumn decorator in typeorm

  // ... Other fields and relations
}
