package org.example.proyectofinal.services;

import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Producto;
import org.example.proyectofinal.repositories.ProductoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;

    public Producto crearProducto(Producto producto) {
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

    public ResponseEntity<Void> eliminarProducto(Long id) {
        Producto productoExistente = obtenerProductoPorId(id);
        productoRepository.delete(productoExistente);
        return ResponseEntity.noContent().build();
    }
}
