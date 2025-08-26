package org.example.proyectofinal.controller;
import lombok.RequiredArgsConstructor;
import org.example.proyectofinal.entities.Movimiento;
import org.example.proyectofinal.repositories.MovimientoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class MovimientoStockController {

    private final MovimientoRepository movimientoStockRepository;

    @GetMapping("/{productoId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('EMPLEADO')")
    public List<Movimiento> getHistorial(@PathVariable Long productoId) {
        return movimientoStockRepository.findByProducto_IdOrderByFechaMovimientoDesc(productoId);
    }

    @GetMapping
    public Page<Movimiento> getHistorialCompleto(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("fechaMovimiento").descending());
        return movimientoStockRepository.findAllByOrderByFechaMovimientoDesc(pageRequest);
    }

    @GetMapping("/usuario/{usuario}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('EMPLEADO')")
    public List<Movimiento> getHistorialPorUsuario(@PathVariable String usuario) {
        return movimientoStockRepository.findByUsuarioOrderByFechaMovimientoDesc(usuario);
    }

    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('EMPLEADO')")
    public List<Movimiento> getHistorialPorTipo(@PathVariable String tipo) {
        return movimientoStockRepository.findByTipoOrderByFechaMovimientoDesc(tipo);
    }
}
