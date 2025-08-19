-- Create stock table for tracking inventory movements
CREATE TABLE IF NOT EXISTS stock (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    tipo_movimiento VARCHAR(50) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE_INVENTARIO')),
    usuario VARCHAR(255) NOT NULL,
    fecha_movimiento TIMESTAMP NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_producto_id ON stock(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_fecha_movimiento ON stock(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_stock_tipo_movimiento ON stock(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_stock_usuario ON stock(usuario);
