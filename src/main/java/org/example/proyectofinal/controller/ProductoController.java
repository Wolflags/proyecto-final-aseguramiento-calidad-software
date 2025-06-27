package org.example.proyectofinal.controller;

    import lombok.RequiredArgsConstructor;
    import org.example.proyectofinal.entities.Producto;
    import org.example.proyectofinal.services.ProductoService;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/productos")
    @RequiredArgsConstructor
    public class ProductoController {

        private final ProductoService productoService;

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
            return ResponseEntity.ok(productoService.crearProducto(producto));
        }

        @GetMapping("/listar")
        public ResponseEntity<List<Producto>> listarProductos() {
            return ResponseEntity.ok(productoService.listarProductos());
        }

        @GetMapping("/{id}")
        public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
            return ResponseEntity.ok(productoService.obtenerProductoPorId(id));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLEADO')")
        public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto productoActualizado) {
            return ResponseEntity.ok(productoService.actualizarProducto(id, productoActualizado));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
            return productoService.eliminarProducto(id);
        }

        @GetMapping("/buscar/nombre")
        public ResponseEntity<List<Producto>> buscarProductosPorNombre(@RequestParam String nombre) {
            return ResponseEntity.ok(productoService.buscarProductosPorNombre(nombre));
        }

        @GetMapping("/buscar/categoria")
        public ResponseEntity<List<Producto>> buscarProductosPorCategoria(@RequestParam String categoria) {
            return ResponseEntity.ok(productoService.buscarProductosPorCategoria(categoria));
        }
    }