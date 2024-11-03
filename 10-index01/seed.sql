-- In real app, these are imported from an external source

-- Insert organizations with unique zip codes
DO $$
DECLARE
    org_id INT;
    base_zip_code INT := 10000;  -- Starting base for zip codes
    unique_zip_code VARCHAR(20);
BEGIN
    FOR org_id IN 1..100000 LOOP  -- Create 100,000 organizations
        -- Generate the unique zip code
        unique_zip_code := LPAD(base_zip_code::TEXT, 5, '0');
        
        -- Insert organization with the unique zip code
        INSERT INTO organizations (name, zip_code) 
        VALUES ('Organization ' || org_id, unique_zip_code);
        
        -- Increment the base zip code for the next organization
        base_zip_code := base_zip_code + 1;
    END LOOP;
END $$;

-- Distribute zip codes from organizations into regions
DO $$
DECLARE
    region_id INT := 1;
    zip_code_list VARCHAR(20)[];
    zip_code_count INT := 0;
    org RECORD;
BEGIN
    -- Iterate over the zip codes to build regions
    FOR org IN SELECT zip_code FROM organizations LOOP
        -- Add the zip code to the current region list
        zip_code_list := array_append(zip_code_list, org.zip_code);
        zip_code_count := zip_code_count + 1;

        -- If the region reaches a size between 200 and 500 zip codes, 
        -- insert it and start a new region
        IF zip_code_count >= 200 AND (zip_code_count >= 500 OR random() < 0.5) THEN
            -- Insert the current region with accumulated zip codes
            INSERT INTO regions (name, zip_codes) 
            VALUES ('Region ' || region_id, zip_code_list);

            -- Reset for the next region
            region_id := region_id + 1;
            zip_code_list := ARRAY[]::VARCHAR(20)[];
            zip_code_count := 0;
        END IF;
    END LOOP;

    -- Insert any remaining zip codes as the last region
    IF zip_code_count > 0 THEN
        INSERT INTO regions (name, zip_codes) 
        VALUES ('Region ' || region_id, zip_code_list);
    END IF;
END $$;
