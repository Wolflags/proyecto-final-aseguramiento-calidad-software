package org.example.proyectofinal.repositories;

import org.example.proyectofinal.entities.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    
    List<Stock> findByProductoIdOrderByFechaMovimientoDesc(Long productoId);
    
    List<Stock> findAllByOrderByFechaMovimientoDesc();
    
    List<Stock> findByUsuarioOrderByFechaMovimientoDesc(String usuario);
    
    List<Stock> findByTipoMovimientoOrderByFechaMovimientoDesc(Stock.TipoMovimiento tipoMovimiento);
    
    List<Stock> findByFechaMovimientoBetweenOrderByFechaMovimientoDesc(
            LocalDateTime fechaInicio, 
            LocalDateTime fechaFin
    );
    
    @Query("SELECT s FROM Stock s WHERE s.productoId = :productoId AND s.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin ORDER BY s.fechaMovimiento DESC")
    List<Stock> findMovimientosByProductoAndFecha(
            @Param("productoId") Long productoId,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );
}
