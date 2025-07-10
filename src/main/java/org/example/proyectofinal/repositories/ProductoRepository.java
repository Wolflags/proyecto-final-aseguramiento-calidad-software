package org.example.proyectofinal.repositories;

import org.example.proyectofinal.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByCategoriaContainingIgnoreCase(String categoria);
    boolean existsByNombre(String nombre);
}
