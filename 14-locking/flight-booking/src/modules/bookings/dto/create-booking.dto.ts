import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateBookingDTO {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  flightId: number;

  @IsNotEmpty()
  @IsString()
  seatCode: string;
}
