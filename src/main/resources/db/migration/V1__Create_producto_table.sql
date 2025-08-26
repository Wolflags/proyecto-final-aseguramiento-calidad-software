-- Ensure producto table exists with all required columns
CREATE TABLE IF NOT EXISTS producto (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    cantidad_inicial INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5
);

-- Add stock_minimo column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto' 
        AND column_name = 'stock_minimo'
    ) THEN
        ALTER TABLE producto ADD COLUMN stock_minimo INTEGER DEFAULT 5;
        UPDATE producto SET stock_minimo = 5 WHERE stock_minimo IS NULL;
        ALTER TABLE producto ALTER COLUMN stock_minimo SET NOT NULL;
    END IF;
END $$;
