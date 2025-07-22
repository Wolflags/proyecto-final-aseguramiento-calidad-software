package org.example.proyectofinal.services;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Producto;
import org.example.proyectofinal.repositories.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;

    public void actualizarStock(Long productId, int cantidad, String tipoMovimiento, String usuario) {
        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        if (tipoMovimiento.equalsIgnoreCase("ENTRADA")) {
            producto.setCantidadInicial(producto.getCantidadInicial() + cantidad);
        } else if (tipoMovimiento.equalsIgnoreCase("SALIDA")) {
            if (producto.getCantidadInicial() < cantidad) {
                throw new RuntimeException("No hay suficiente stock para realizar la salida");
            }
            producto.setCantidadInicial(producto.getCantidadInicial() - cantidad);
        } else {
            throw new IllegalArgumentException("Tipo de movimiento no válido: " + tipoMovimiento);
        }

        productoRepository.save(producto);
    }

    public Producto crearProducto(Producto producto) {
        if (productoRepository.existsByNombre(producto.getNombre())) {
            throw new IllegalArgumentException("Ya existe un producto con el nombre: " + producto.getNombre());
        }
        return productoRepository.save(producto);
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


    //termina filtrado
    public Producto actualizarProducto(Long id, Producto productoActualizado) {
        Producto productoExistente = obtenerProductoPorId(id);
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setDescripcion(productoActualizado.getDescripcion());
        productoExistente.setCategoria(productoActualizado.getCategoria());
        productoExistente.setPrecio(productoActualizado.getPrecio());
        productoExistente.setCantidadInicial(productoActualizado.getCantidadInicial());
        return productoRepository.save(productoExistente);
    }

    public ResponseEntity<String> eliminarProducto(Long id) {
        Producto productoExistente = obtenerProductoPorId(id);
        productoRepository.delete(productoExistente);
        return ResponseEntity.ok("Producto eliminado exitosamente");
    }
}
