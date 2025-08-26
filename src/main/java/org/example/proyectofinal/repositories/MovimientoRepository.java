package org.example.proyectofinal.repositories;

import org.example.proyectofinal.entities.Movimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findByProducto_IdOrderByFechaMovimientoDesc(Long productoId);

    List<Movimiento> findByUsuarioOrderByFechaMovimientoDesc(String usuario);

    List<Movimiento> findByTipoOrderByFechaMovimientoDesc(String tipo);

    List<Movimiento> findByFechaMovimientoBetweenOrderByFechaMovimientoDesc(
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin
    );

    Page<Movimiento> findAllByOrderByFechaMovimientoDesc(Pageable pageable);

    @Query("SELECT m FROM Movimiento m JOIN FETCH m.producto ORDER BY m.fechaMovimiento DESC")
    List<Movimiento> findAllWithProductoOrderByFechaMovimientoDesc();

    void deleteAllByProductoId(Long id);
}
