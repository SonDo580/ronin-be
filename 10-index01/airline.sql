-- The schemas are based on the diagram in lecture 9

-- Common columns:
--
-- data JSONB
-- created_at TIMESTAMPTZ DEFAULT NOW(),
-- created_by BIGINT,
-- updated_at TIMESTAMPTZ DEFAULT NOW(),
-- updated_by BIGINT

-- Note:
-- - Assume that the currency is USD
-- - Create indexes on the following tables: 
--   flights, passengers, bookings, booking_directions, tickets, transactions
-- - Some tables don't need additional indexes. 
--   We can use their primary key.

CREATE TABLE airplanes (
    airplane_code VARCHAR(10) PRIMARY KEY,-- ex: "A320"
    name VARCHAR(100) NOT NULL, -- ex: "Boeing 747"
    status VARCHAR(20) NOT NULL -- ex: "active", "maintenance"
);

CREATE TABLE seats (
    seat_code VARCHAR(10) PRIMARY KEY, -- ex: "21A"
    airplane_id BIGINT,
    class VARCHAR(20), -- ex: "economy", "business"
);

CREATE TABLE airports (
    airport_code VARCHAR(3) PRIMARY KEY, -- ex: "HAN", "SGN"
    name VARCHAR(100) NOT NULL, -- ex: "Noi Bai", "Tan Son Nhat"
);

CREATE TABLE flights (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    airplane_code VARCHAR(10)
    departure_airport VARCHAR(3), -- airport code 
    arrival_airport VARCHAR(3), -- airport code        
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL -- ex: "scheduled", "departed", "arrived", "canceled"
);

-- These fields will be frequently accessed in flight search
CREATE INDEX idx_departure_airport ON flights(departure_airport);
CREATE INDEX idx_arrival_airport ON flights(arrival_airport);
CREATE INDEX idx_departure_time ON flights(departure_time);
CREATE INDEX idx_arrival_time ON flights(arrival_time);

CREATE TABLE seat_availability (
    flight_id BIGINT, 
    seat_code VARCHAR(10),   
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- ex: "available", "reserved"

    PRIMARY KEY (flight_id, seat_code)
);

CREATE TABLE passengers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20)
    email VARCHAR(255) 
);

-- Lookup passenger information
CREATE INDEX idx_passenger_email ON passengers(email COLLATE "C");
CREATE INDEX idx_passenger_phone ON passengers(phone_number);

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ticket_amount DECIMAL(10, 2) NOT NULL,
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL
    checkout_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT "init" -- ex: "init", "paid", "ticketed", "done"
);

-- Filter bookings based on payment status 
CREATE INDEX idx_booking_status ON bookings(status);

CREATE TABLE booking_directions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    booking_id BIGINT,
    flight_id BIGINT,
    direction VARCHAR(10), -- ex: "away", "return"
    amount DECIMAL(10, 2) NOT NULL
);

-- Retrieving directions associated with a specific booking 
CREATE INDEX idx_booking_direction_booking ON booking_directions(booking_id);

CREATE TABLE booking_line (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    booking_direction_id BIGINT,
    type VARCHAR(10) NOT NULL, -- ex: "ticket", "vat", "fee",
    unit_amount DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    subtotal_amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE tickets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    booking_id BIGINT,
    passenger_id BIGINT,
    flight_id BIGINT,
    seat_code VARCHAR(10),
    amount DECIMAL(10, 2) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL, -- ex: "issued", "canceled", "checked_in"
);

-- Retrieving tickets associated with specific bookings, passengers
-- Filtering tickets based on status
CREATE INDEX idx_ticket_booking ON tickets(booking_id);
CREATE INDEX idx_ticket_passenger ON tickets(passenger_id);
CREATE INDEX idx_ticket_status ON tickets(status);

CREATE TABLE booking_directions_tickets (
    booking_direction_id BIGINT,              
    ticket_id BIGINT,         

    PRIMARY KEY (booking_direction_id, ticket_id)
);

CREATE TABLE pricing_config (
    key VARCHAR(20) PRIMARY KEY, -- ex: "discount_rate"
    value DECIMAL(5, 4) NOT NULL -- ex: 0.02 (2%)
);

CREATE TABLE transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    type VARCHAR(10) NOT NULL, -- ex: "payment", "refund"

    debit_account_number VARCHAR(50),
    credit_account_number VARCHAR(50),
    payment_method VARCHAR(20), -- ex: "credit_card", "bank_transfer", ...

    amount DECIMAL(10, 2) NOT NULL,
    fee DECIMAL(10, 2),

    booking_id
);

-- Lookup transactions related to specific bookings
-- Filter transactions based on type
CREATE INDEX idx_transaction_booking ON transactions(booking_id);
CREATE INDEX idx_transaction_type ON transactions(type);

