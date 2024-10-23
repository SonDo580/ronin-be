create table ticket_flights_0 as select * from ticket_flights tf;
-- ticket_flights has PRIMARY KEY (ticket_no, flight_id)
-- ticket_flights_0 doesn't have any index

-- 1. Index can speeds up read query
select * from ticket_flights tf where ticket_no = '0005433835394'; -- 0.005s
explain select * from ticket_flights tf where ticket_no = '0005433835394';
-- Index Scan using ticket_flights_pkey on ticket_flights tf  (cost=0.56..16.58 rows=3 width=32)

select * from ticket_flights_0 tf0 where ticket_no = '0005433835394'; -- 3s
explain select * from ticket_flights_0 tf0 where ticket_no = '0005433835394';
-- Parallel Seq Scan on ticket_flights_0 tf0  (cost=0.00..113658.89 rows=1 width=32)

-- 2. The first column (ticket_no) must exist in the condition, using flight_id alone will not work
select * from ticket_flights tf where flight_id = '89925'; -- 2s
explain select * from ticket_flights tf where flight_id = '89925'; 
-- Parallel Seq Scan on ticket_flights tf  (cost=0.00..113664.59 rows=43 width=32)

-- 3. Using OR in condition -> full table scan
select * from ticket_flights tf where ticket_no = '0005433835394' and flight_id > 80000; -- 0.002s
explain select * from ticket_flights tf where ticket_no = '0005433835394' and flight_id > 80000;
-- Index Scan using ticket_flights_pkey on ticket_flights tf  (cost=0.56..12.58 rows=2 width=32)

select * from ticket_flights tf where ticket_no = '0005433835394' or flight_id > 80000; -- 0.013s
explain select * from ticket_flights tf where ticket_no = '0005433835394' or flight_id > 80000;
-- Seq Scan on ticket_flights tf  (cost=0.00..195829.23 rows=4131820 width=32)

-- 4. Using calculated value -> not use index
select * from ticket_flights tf where ticket_no || '' = '0005433835394'; -- 3s
explain select * from ticket_flights tf where ticket_no || '' = '0005433835394';
-- Parallel Seq Scan on ticket_flights tf  (cost=0.00..131146.43 rows=17482 width=32)

select * from ticket_flights tf where length(ticket_no) = 13; -- 3s
explain select * from ticket_flights tf where length(ticket_no) = 13;
-- Parallel Seq Scan on ticket_flights tf  (cost=0.00..122405.51 rows=17482 width=32)

--**********
create table tickets_0 as select * from tickets t;
create index idx_passenger_name on tickets_0 (passenger_name);
create index idx_book_ref_passenger_id on tickets_0 (book_ref, passenger_id);

-- 5. Pattern matching - only work for prefix match
explain select * from tickets_0 t0 where passenger_name LIKE 'GA%';
explain select * from tickets_0 t0  where passenger_name LIKE '%NOVA';
-- Both queries use sequential scan. 
-- The first query doesn't work as expected

-- Fix: add collate "C" when creating index
--      (how to compare and sort text strings)
create index idx_passenger_name_1 on tickets_0 (passenger_name collate "C");

explain select * from tickets_0 t0 where passenger_name LIKE 'GA%';
--  Bitmap Index Scan on idx_passenger_name_1  (cost=0.00..733.02 rows=53259 width=0)

-- 6. Covering index -> don't need to check clustered index
explain select book_ref, passenger_id from tickets_0 t0 where book_ref = 'B2E809';
-- Index ONLY Scan using idx_book_ref_passenger_id on tickets_0 t0  (cost=0.43..8.46 rows=2 width=19)

explain select passenger_name from tickets_0 t0 where book_ref = 'B2E809';
-- Index Scan using idx_book_ref_passenger_id on tickets_0 t0  (cost=0.43..12.46 rows=2 width=16)