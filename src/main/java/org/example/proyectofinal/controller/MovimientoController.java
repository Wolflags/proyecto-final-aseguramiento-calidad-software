package org.example.proyectofinal.controller;

import org.example.proyectofinal.entities.Movimiento;
import org.example.proyectofinal.services.MovimientoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*") // si lo usas desde React
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    // Registrar un nuevo movimiento
    @PostMapping
    public Movimiento registrar(@RequestBody Movimiento movimiento) {
        return movimientoService.registrarMovimiento(movimiento);
    }

    // Listar todos los movimientos
    @GetMapping
    public List<Movimiento> listarTodos() {
        return movimientoService.listarTodos();
    }

    // Listar movimientos por producto
    @GetMapping("/producto/{productoId}")
    public List<Movimiento> listarPorProducto(@PathVariable Long productoId) {
        return movimientoService.listarPorProducto(productoId);
    }
}