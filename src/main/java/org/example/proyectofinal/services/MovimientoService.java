package org.example.proyectofinal.services;

import org.example.proyectofinal.entities.Movimiento;
import org.example.proyectofinal.repositories.MovimientoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovimientoService {
    private final MovimientoRepository movimientoRepository;

    public MovimientoService(MovimientoRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    public Movimiento registrarMovimiento(Movimiento movimiento) {
        return movimientoRepository.save(movimiento);
    }

    public List<Movimiento> listarPorProducto(Long productoId) {
        return movimientoRepository.findByProductoId(productoId);
    }

    public List<Movimiento> listarTodos() {
        return movimientoRepository.findAll();
    }
}
