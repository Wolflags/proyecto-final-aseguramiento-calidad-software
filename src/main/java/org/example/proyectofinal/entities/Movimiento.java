package org.example.proyectofinal.entities;

import jakarta.persistence.*;
        import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimiento {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(optional = false)
        private Producto producto;

        private String usuario; // nombre del usuario que hizo el cambio
        private String tipo;    // "ENTRADA" o "SALIDA"
        private int cantidad;
        private String motivo;
        private LocalDateTime fechaMovimiento;
    }


