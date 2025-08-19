-- Add stock_minimo column to producto table if it doesn't exist
ALTER TABLE producto ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 5;

-- Update existing products with a default minimum stock value
UPDATE producto SET stock_minimo = 5 WHERE stock_minimo IS NULL;

-- Make the column NOT NULL
ALTER TABLE producto ALTER COLUMN stock_minimo SET NOT NULL;
