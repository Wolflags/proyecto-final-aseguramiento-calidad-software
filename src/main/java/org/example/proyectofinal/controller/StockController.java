package org.example.proyectofinal.controller;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Producto;
import org.example.proyectofinal.entities.Stock;
import org.example.proyectofinal.services.StockServices;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class StockController {

    private final StockServices stockServices;

    @PostMapping("/movimiento")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('EMPLEADO')")
    public ResponseEntity<?> registrarMovimiento(
            @RequestBody MovimientoStockRequest request,
            Authentication authentication) {
        try {
            String usuario = authentication.getName();
            Stock movimiento = stockServices.registrarMovimientoStock(
                    request.getProductoId(),
                    request.getCantidad(),
                    request.getTipoMovimiento(),
                    usuario,
                    request.getObservaciones()
            );
            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Stock>> obtenerHistorialCompleto() {
        List<Stock> movimientos = stockServices.obtenerHistorialMovimientos();
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/historial/producto/{productoId}")
    public ResponseEntity<List<Stock>> obtenerHistorialPorProducto(@PathVariable Long productoId) {
        List<Stock> movimientos = stockServices.obtenerHistorialPorProducto(productoId);
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/historial/usuario/{usuario}")
    public ResponseEntity<List<Stock>> obtenerHistorialPorUsuario(@PathVariable String usuario) {
        List<Stock> movimientos = stockServices.obtenerHistorialPorUsuario(usuario);
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/historial/tipo/{tipo}")
    public ResponseEntity<List<Stock>> obtenerMovimientosPorTipo(@PathVariable Stock.TipoMovimiento tipo) {
        List<Stock> movimientos = stockServices.obtenerMovimientosPorTipo(tipo);
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/historial/fecha")
    public ResponseEntity<List<Stock>> obtenerMovimientosPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        List<Stock> movimientos = stockServices.obtenerMovimientosPorFecha(fechaInicio, fechaFin);
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/alertas/stock-minimo")
    public ResponseEntity<List<Producto>> obtenerProductosStockMinimo() {
        List<Producto> productos = stockServices.obtenerProductosStockMinimo();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/alertas/sin-stock")
    public ResponseEntity<List<Producto>> obtenerProductosSinStock() {
        List<Producto> productos = stockServices.obtenerProductosSinStock();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/verificar-stock-minimo/{productoId}")
    public ResponseEntity<Map<String, Boolean>> verificarStockMinimo(@PathVariable Long productoId) {
        boolean esStockMinimo = stockServices.verificarStockMinimo(productoId);
        return ResponseEntity.ok(Map.of("esStockMinimo", esStockMinimo));
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> estadisticas = stockServices.obtenerEstadisticasStock();
        return ResponseEntity.ok(estadisticas);
    }

    // DTO para las requests de movimiento de stock
    public static class MovimientoStockRequest {
        private Long productoId;
        private Integer cantidad;
        private Stock.TipoMovimiento tipoMovimiento;
        private String observaciones;

        // Getters y setters
        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

        public Stock.TipoMovimiento getTipoMovimiento() { return tipoMovimiento; }
        public void setTipoMovimiento(Stock.TipoMovimiento tipoMovimiento) { this.tipoMovimiento = tipoMovimiento; }

        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    }
}
