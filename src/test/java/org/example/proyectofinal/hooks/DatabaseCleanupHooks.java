package org.example.proyectofinal.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Hooks de Cucumber para limpiar la base de datos antes de cada escenario
 * Funciona con H2 en memoria para tests
 */
@ActiveProfiles("test")
public class DatabaseCleanupHooks {

    @Autowired
    private DataSource dataSource;

    @Before
    @Transactional
    public void cleanDatabase() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Deshabilitar las restricciones de clave foránea temporalmente para H2
            statement.execute("SET REFERENTIAL_INTEGRITY FALSE");
            
            // Limpiar tablas en orden específico para evitar conflictos de FK
            String[] tablesToClean = {"movimiento", "stock", "producto"};
            
            for (String table : tablesToClean) {
                try {
                    statement.execute("TRUNCATE TABLE " + table + " RESTART IDENTITY");
                } catch (Exception e) {
                    // Si TRUNCATE falla (tabla no existe), intentar DELETE
                    try {
                        statement.execute("DELETE FROM " + table);
                    } catch (Exception deleteException) {
                        // La tabla puede no existir aún - ignorar
                        System.out.println("Info: Table " + table + " may not exist yet: " + deleteException.getMessage());
                    }
                }
            }
            
            // Re-habilitar las restricciones de clave foránea
            statement.execute("SET REFERENTIAL_INTEGRITY TRUE");
            
        } catch (Exception e) {
            // Log pero no fallar completamente - algunos tests pueden no necesitar limpieza
            System.err.println("Warning: Could not clean database: " + e.getMessage());
        }
    }

    @After
    public void tearDown() {
        // Con H2 en memoria y create-drop, no necesitamos hacer nada específico aquí
        // La base de datos se limpia automáticamente entre contextos de Spring
    }
}
