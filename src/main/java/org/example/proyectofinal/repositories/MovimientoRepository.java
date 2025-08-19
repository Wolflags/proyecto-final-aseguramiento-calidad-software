package org.example.proyectofinal.repositories;

import org.example.proyectofinal.entities.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoRepository  extends JpaRepository<Movimiento, Long> {
    // Buscar movimientos por producto
    List<Movimiento> findByProductoId(Long productoId);
}
