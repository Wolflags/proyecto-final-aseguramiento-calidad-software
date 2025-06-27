package org.example.proyectofinal.dto;

        import lombok.AllArgsConstructor;
        import lombok.Data;
        import org.example.proyectofinal.entities.Role;

        import java.util.Set;

        @Data
        @AllArgsConstructor
        public class JwtResponse {
            private String token;
            private String type = "Bearer";
            private String username;
            private Set<Role> roles;

            public JwtResponse(String token, String username, Set<Role> roles) {
                this.token = token;
                this.username = username;
                this.roles = roles;
            }
        }