package org.example.proyectofinal.services;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Producto;
import org.example.proyectofinal.repositories.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.ResponseEntity.ok;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;

    public ResponseEntity<String> crearProducto(Producto producto) {
        if (productoRepository.existsByNombre(producto.getNombre())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un producto con el nombre: " + producto.getNombre());
        }
        productoRepository.save(producto);

        return ResponseEntity.ok("Producto creado exitosamente: " + producto.getNombre());
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

    public boolean existeProductoConNombre(String nombre) {
        return productoRepository.existsByNombre(nombre);
    }


}
