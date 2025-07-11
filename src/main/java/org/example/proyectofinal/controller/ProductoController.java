package org.example.proyectofinal.controller;

    import lombok.RequiredArgsConstructor;
    import org.example.proyectofinal.entities.Producto;
    import org.example.proyectofinal.services.ProductoService;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/productos")
    @RequiredArgsConstructor
    @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
    public class ProductoController {

        private final ProductoService productoService;

        @PostMapping
        @PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
            if (producto.getNombre() == null || producto.getNombre().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre es obligatorio");
            }
            if (producto.getPrecio() <= 0) {
                return ResponseEntity.badRequest().body("El precio debe ser mayor a cero");
            }
            if (producto.getCantidadInicial() < 0) {
                return ResponseEntity.badRequest().body("La cantidad inicial no puede ser negativa");
            }

            try {
                Producto nuevoProducto = productoService.crearProducto(producto);
                return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
            }
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
        @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('EMPLEADO')")
        public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto productoActualizado) {
            return ResponseEntity.ok(productoService.actualizarProducto(id, productoActualizado));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<String> eliminarProducto(@PathVariable Long id) {
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
