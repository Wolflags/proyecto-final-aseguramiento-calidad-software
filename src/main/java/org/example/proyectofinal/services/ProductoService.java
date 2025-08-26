package org.example.proyectofinal.services;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Movimiento;
import org.example.proyectofinal.entities.Producto;
import org.example.proyectofinal.repositories.MovimientoRepository;
import org.example.proyectofinal.repositories.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final MovimientoRepository movimientoRepository;

    public Producto crearProducto(Producto producto, String usuario) {
        if (productoRepository.existsByNombre(producto.getNombre())) {
            throw new IllegalArgumentException("Ya existe un producto con el nombre: " + producto.getNombre());
        }
        Producto productoGuardado = productoRepository.save(producto);

        // Registrar movimiento de creación
        registrarMovimiento(productoGuardado, usuario, "CREACION", productoGuardado.getCantidadInicial(),
                "Producto creado con stock inicial");

        return productoGuardado;
    }

    public Producto crearProducto(Producto producto) {
        return crearProducto(producto, "Sistema");
    }


    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Producto obtenerProductoPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    //filtrado
    public List<Producto> buscarProductosPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> buscarProductosPorCategoria(String categoria) {
        return productoRepository.findByCategoriaContainingIgnoreCase(categoria);
    }


    public Producto actualizarProducto(Long id, Producto productoActualizado, String usuario) {
        Producto productoExistente = obtenerProductoPorId(id);

        // Guardar valores anteriores para el historial
        int cantidadAnterior = productoExistente.getCantidadInicial();

        // Actualizar campos
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setDescripcion(productoActualizado.getDescripcion());
        productoExistente.setCategoria(productoActualizado.getCategoria());
        productoExistente.setPrecio(productoActualizado.getPrecio());
        productoExistente.setCantidadInicial(productoActualizado.getCantidadInicial());

        Producto productoGuardado = productoRepository.save(productoExistente);

        // Registrar movimiento de actualización
        String motivo = "Producto actualizado";
        if (cantidadAnterior != productoActualizado.getCantidadInicial()) {
            int diferencia = productoActualizado.getCantidadInicial() - cantidadAnterior;
            String tipoMovimiento = diferencia > 0 ? "ENTRADA" : "SALIDA";
            motivo += String.format(" - Cantidad cambiada de %d a %d", cantidadAnterior, productoActualizado.getCantidadInicial());
            registrarMovimiento(productoGuardado, usuario, tipoMovimiento, Math.abs(diferencia), motivo);
        } else {
            registrarMovimiento(productoGuardado, usuario, "ACTUALIZACION", 0, motivo);
        }

        return productoGuardado;
    }

    public Producto actualizarProducto(Long id, Producto productoActualizado) {
        return actualizarProducto(id, productoActualizado, "Sistema");
    }

    public Producto actualizarCantidad(Long id, int nuevaCantidad, String tipo, String motivo, String usuario) {
        Producto producto = obtenerProductoPorId(id);
        int diferencia = nuevaCantidad - producto.getCantidadInicial();

        producto.setCantidadInicial(nuevaCantidad);
        productoRepository.save(producto);

        Movimiento movimiento = Movimiento.builder()
                .producto(producto)
                .usuario(usuario)
                .tipo(tipo)
                .cantidad(Math.abs(diferencia))
                .motivo(motivo)
                .fechaMovimiento(LocalDateTime.now())
                .build();

        movimientoRepository.save(movimiento);

        return producto;
    }


    private void registrarMovimiento(Producto producto, String usuario, String tipo, int cantidad, String motivo) {
        Movimiento movimiento = Movimiento.builder()
                .producto(producto)
                .usuario(usuario)
                .tipo(tipo)
                .cantidad(cantidad)
                .motivo(motivo)
                .fechaMovimiento(LocalDateTime.now())
                .build();

        movimientoRepository.save(movimiento);
    }

    @Transactional
    public ResponseEntity<String> eliminarProducto(Long id) {
        Producto productoExistente = obtenerProductoPorId(id);
        // Eliminar todos los movimientos asociados a este producto
        movimientoRepository.deleteAllByProductoId(id);
        // Ahora eliminar el producto
        productoRepository.delete(productoExistente);
        return ResponseEntity.ok("Producto y movimientos eliminados exitosamente");
    }
}