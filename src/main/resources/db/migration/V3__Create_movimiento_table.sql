-- Create movimiento table for tracking product operations history
CREATE TABLE IF NOT EXISTS movimiento (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CREACION', 'ACTUALIZACION', 'ENTRADA', 'SALIDA')),
    cantidad INTEGER NOT NULL DEFAULT 0,
    motivo TEXT,
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movimiento_producto_id ON movimiento(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha_movimiento ON movimiento(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimiento_tipo ON movimiento(tipo);
CREATE INDEX IF NOT EXISTS idx_movimiento_usuario ON movimiento(usuario);
