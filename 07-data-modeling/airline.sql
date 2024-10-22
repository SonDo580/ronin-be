-- Tables for flight-booking feature

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- Business data
    passenger_id BIGINT NOT NULL,
    flight_id BIGINT NOT NULL,
    book_date TIMESTAMPTZ NOT NULL,
    seat_class VARCHAR(10) NOT NULL, -- ex: economic, business,...
    price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL, -- ex: paid, pending,...
    promo_code VARCHAR(20),
    status VARCHAR(20) NOT NULL, -- ex: confirmed, canceled,...

    -- Additional details 
    data JSONB, -- meal preference, booking source, payment method,...

    -- Technical metadata (common)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT
)

CREATE TABLE flights (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- Business data
    flight_code VARCHAR(10) NOT NULL, -- ex: AA113
    airplane_code VARCHAR(10) NOT NULL, -- ex: A320
    departure_airport VARCHAR(3) NOT NULL, -- ex: HAN
    arrival_airport VARCHAR(3) NOT NULL, -- ex: SGN
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL, -- ex: departed, arrived, canceled,...

    -- Additional details 
    data JSONB, -- gate, terminal, distance,...

    -- Technical metadata (common)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT
)

CREATE TABLE passengers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- Business data
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    -- Contact info
    contact JSONB, -- email, phone,...

    -- Additional details
    data JSONB, -- passport_number, nationality, data_of_birth,...

    -- Technical metadata (common)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT
)