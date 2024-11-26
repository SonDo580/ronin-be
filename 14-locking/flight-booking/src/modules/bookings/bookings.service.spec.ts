import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  SeatAvailability,
  SeatAvailabilityStatus,
} from '../seats/entities/seat-availability.entity';
import { Booking } from './entities/booking.entity';
import { RedisService } from '../redis/redis.service';

describe('Test Bookings Service', () => {
  let bookingsService: BookingsService;
  let dataSourceMock: Partial<DataSource>;
  let redisServiceMock: Partial<RedisService>;

  // Sample payload
  const bookingPayload = {
    flightId: 1,
    seatCode: '21A',
  };

  // Helper to create entity manager mock
  const createEntityManagerMock = ({
    seatMock,
    bookingMock = null,
    setLockMock = jest.fn().mockReturnThis(),
  }: {
    seatMock: Partial<SeatAvailability>;
    bookingMock?: Partial<Booking>;
    setLockMock?: jest.Mock;
  }) => ({
    getRepository: jest.fn().mockImplementation((entity) => {
      const repositoryMockDict = {
        [SeatAvailability.name]: {
          createQueryBuilder: jest.fn().mockReturnThis(),
          setLock: setLockMock,
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(seatMock),
        },
      };

      const repositoryMock = repositoryMockDict[entity.name];
      if (!repositoryMock) {
        throw new Error(`Unexpected entity: ${entity.name}`);
      }

      return repositoryMock;
    }),
    save: jest.fn().mockImplementation((entity, data) => {
      const returnValueDict = {
        [SeatAvailability.name]: seatMock,
        [Booking.name]: bookingMock,
      };

      const returnValue = returnValueDict[entity.name];
      if (!returnValue) {
        throw new Error(`Unexpected entity: ${entity.name}`);
      }

      return returnValue;
    }),
    create: jest.fn().mockImplementation((entity, data) => {
      const returnValueDict = {
        [SeatAvailability.name]: seatMock,
        [Booking.name]: bookingMock,
      };

      const returnValue = returnValueDict[entity.name];
      if (!returnValue) {
        throw new Error(`Unexpected entity: ${entity.name}`);
      }

      return returnValue;
    }),
  });

  beforeEach(async () => {
    dataSourceMock = jest.fn();
    redisServiceMock = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: RedisService, useValue: redisServiceMock },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
  });

  describe('Test booking with pessimistic locking', () => {
    it('The seat is not found', async () => {
      const seatMock = null;

      const entityManagerMock = createEntityManagerMock({ seatMock });
      dataSourceMock.transaction = jest
        .fn()
        .mockImplementation(async (cb) => cb(entityManagerMock));

      await expect(
        bookingsService.bookSeatPessimistic(bookingPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('The seat is not available', async () => {
      const seatMock = {
        status: SeatAvailabilityStatus.RESERVED,
      };

      const entityManagerMock = createEntityManagerMock({ seatMock });
      dataSourceMock.transaction = jest
        .fn()
        .mockImplementation(async (cb) => cb(entityManagerMock));

      await expect(
        bookingsService.bookSeatPessimistic(bookingPayload),
      ).rejects.toThrow(ConflictException);
    });

    it('Reserve a seat and create a booking successfully', async () => {
      const seatMock = { status: SeatAvailabilityStatus.AVAILABLE, price: 100 };
      const bookingMock = { id: 1 };

      const entityManagerMock = createEntityManagerMock({
        seatMock,
        bookingMock,
      });

      dataSourceMock.transaction = jest
        .fn()
        .mockImplementation(async (cb) => cb(entityManagerMock));

      const result = await bookingsService.bookSeatPessimistic(bookingPayload);

      expect(result).toEqual({ bookingId: bookingMock.id });
    });

    it('Verify setLock invocation', async () => {
      const seatMock = { status: SeatAvailabilityStatus.AVAILABLE, price: 100 };
      const bookingMock = { id: 1 };
      const setLockMock = jest.fn().mockReturnThis();

      const entityManagerMock = createEntityManagerMock({
        seatMock,
        bookingMock,
        setLockMock,
      });

      dataSourceMock.transaction = jest
        .fn()
        .mockImplementation(async (cb) => cb(entityManagerMock));

      await bookingsService.bookSeatPessimistic(bookingPayload);

      expect(setLockMock).toHaveBeenCalledWith('pessimistic_write');
    });
  });
});
