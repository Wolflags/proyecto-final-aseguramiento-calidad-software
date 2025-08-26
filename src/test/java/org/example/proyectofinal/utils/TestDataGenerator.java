package org.example.proyectofinal.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Utilidad para generar datos únicos en los tests
 * Esto ayuda a evitar conflictos cuando los tests se ejecutan múltiples veces
 */
public class TestDataGenerator {
    
    private static final AtomicInteger counter = new AtomicInteger(0);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
    /**
     * Genera un nombre único para productos en tests
     * @param baseName nombre base del producto
     * @return nombre único con timestamp y contador
     */
    public static String generateUniqueProductName(String baseName) {
        String timestamp = LocalDateTime.now().format(formatter);
        int count = counter.incrementAndGet();
        return baseName + "_" + timestamp + "_" + count;
    }
    
    /**
     * Genera una descripción única para productos en tests
     * @param baseDescription descripción base del producto
     * @return descripción única con timestamp
     */
    public static String generateUniqueDescription(String baseDescription) {
        String timestamp = LocalDateTime.now().format(formatter);
        return baseDescription + " (Test " + timestamp + ")";
    }
    
    /**
     * Resetea el contador (útil para tests)
     */
    public static void resetCounter() {
        counter.set(0);
    }
}
