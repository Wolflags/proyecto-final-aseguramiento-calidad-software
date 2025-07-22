package org.example.proyectofinal.services;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Producto;
import org.example.proyectofinal.entities.Stock;
import org.example.proyectofinal.repositories.ProductoRepository;
import org.example.proyectofinal.repositories.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockServices {
    
    private final StockRepository stockRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public Stock registrarMovimientoStock(Long productoId, int cantidad, Stock.TipoMovimiento tipoMovimiento, 
                                          String usuario, String observaciones) {
        // Validar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));

        // Validar cantidad
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        // Para salidas, verificar que hay suficiente stock
        if (tipoMovimiento == Stock.TipoMovimiento.SALIDA && producto.getCantidadInicial() < cantidad) {
            throw new IllegalArgumentException("Stock insuficiente. Stock actual: " + producto.getCantidadInicial());
        }

        // Actualizar el stock del producto
        int nuevoStock = producto.getCantidadInicial();
        switch (tipoMovimiento) {
            case ENTRADA:
                nuevoStock += cantidad;
                break;
            case SALIDA:
                nuevoStock -= cantidad;
                break;
            case AJUSTE_INVENTARIO:
                nuevoStock = cantidad; // En ajuste, la cantidad es el nuevo total
                break;
        }

        producto.setCantidadInicial(nuevoStock);
        productoRepository.save(producto);

        // Crear registro del movimiento
        Stock movimiento = Stock.builder()
                .productoId(productoId)
                .cantidad(cantidad)
                .tipoMovimiento(tipoMovimiento)
                .usuario(usuario)
                .fechaMovimiento(LocalDateTime.now())
                .observaciones(observaciones)
                .build();

        return stockRepository.save(movimiento);
    }

    public List<Stock> obtenerHistorialMovimientos() {
        return stockRepository.findAllByOrderByFechaMovimientoDesc();
    }

    public List<Stock> obtenerHistorialPorProducto(Long productoId) {
        return stockRepository.findByProductoIdOrderByFechaMovimientoDesc(productoId);
    }

    public List<Stock> obtenerHistorialPorUsuario(String usuario) {
        return stockRepository.findByUsuarioOrderByFechaMovimientoDesc(usuario);
    }

    public List<Stock> obtenerMovimientosPorTipo(Stock.TipoMovimiento tipo) {
        return stockRepository.findByTipoMovimientoOrderByFechaMovimientoDesc(tipo);
    }

    public List<Stock> obtenerMovimientosPorFecha(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return stockRepository.findByFechaMovimientoBetweenOrderByFechaMovimientoDesc(fechaInicio, fechaFin);
    }

    public List<Producto> obtenerProductosStockMinimo() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .filter(p -> p.getCantidadInicial() <= p.getStockMinimo())
                .collect(Collectors.toList());
    }

    public List<Producto> obtenerProductosSinStock() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .filter(p -> p.getCantidadInicial() == 0)
                .collect(Collectors.toList());
    }

    public boolean verificarStockMinimo(Long productoId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return producto.getCantidadInicial() <= producto.getStockMinimo();
    }

    public Map<String, Object> obtenerEstadisticasStock() {
        List<Producto> productos = productoRepository.findAll();
        
        long totalProductos = productos.size();
        long productosStockBajo = productos.stream()
                .mapToLong(p -> p.getCantidadInicial() <= p.getStockMinimo() ? 1 : 0)
                .sum();
        long productosSinStock = productos.stream()
                .mapToLong(p -> p.getCantidadInicial() == 0 ? 1 : 0)
                .sum();
        double valorTotalInventario = productos.stream()
                .mapToDouble(p -> p.getPrecio() * p.getCantidadInicial())
                .sum();

        return Map.of(
                "totalProductos", totalProductos,
                "productosStockBajo", productosStockBajo,
                "productosSinStock", productosSinStock,
                "valorTotalInventario", valorTotalInventario
        );
    }
}
