package com.config;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * SecurityConfig
 * ==============
 *
 * Centralized Spring Security configuration for the application.
 *
 * <p>
 * <strong>Security model:</strong>
 * </p>
 * <ul>
 * <li>Stateless JWT-based authentication</li>
 * <li>Role-based authorization using Spring Security conventions</li>
 * <li>Method-level security via {@code @PreAuthorize}</li>
 * </ul>
 *
 * <p>
 * This configuration:
 * </p>
 * <ul>
 * <li>Disables session state and CSRF</li>
 * <li>Integrates a custom {@link JwtAuthenticationFilter}</li>
 * <li>Defines clear access boundaries per API group</li>
 * </ul>
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        /**
         * Constructor injection of JWT authentication filter.
         *
         * @param jwtAuthenticationFilter filter responsible for extracting
         *                                and validating JWT tokens
         */
        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        /**
         * Configures the Spring Security filter chain.
         *
         * @param http HttpSecurity configuration entry point
         * @return configured {@link SecurityFilterChain}
         * @throws Exception in case of configuration errors
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                /*
                                 * ================= CORS CONFIGURATION =================
                                 * Required for browser-based clients (e.g. React, Angular).
                                 * Preflight (OPTIONS) requests must be allowed.
                                 */
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                /*
                                 * ================= CSRF =================
                                 * Disabled because the application is stateless
                                 * and uses JWTs instead of cookies.
                                 */
                                .csrf(csrf -> csrf.disable())

                                /*
                                 * ================= SESSION MANAGEMENT =================
                                 * Enforce stateless behavior.
                                 * Spring Security will not create or use HTTP sessions.
                                 */
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                /* ================= AUTHORIZATION RULES ================= */
                                .authorizeHttpRequests(auth -> auth

                                                // Allow CORS preflight requests
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // ---------------- PUBLIC ENDPOINTS ----------------
                                                .requestMatchers(
                                                                "/error",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/api/auth/**",
                                                                "/api/public/**",
                                                                "/api/images/**",
                                                                "/actuator/**")
                                                .permitAll()

                                                // Allow public GET access to products
                                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                                                // ---------------- MODERATOR ACCESS ----------------
                                                .requestMatchers("/api/moderators/**")
                                                .hasAnyRole("MODERATOR", "ADMIN")

                                                // ---------------- SHARED ADMIN/MODERATOR ENDPOINTS ----------------
                                                .requestMatchers(
                                                                "/api/admin/orders/**",
                                                                "/api/admin/products/**",
                                                                "/api/admin/inventory/**",
                                                                "/api/admin/reviews/**")
                                                .hasAnyRole("ADMIN", "MODERATOR")

                                                // ---------------- ADMIN ONLY ----------------
                                                .requestMatchers("/api/admin/**")
                                                .hasAnyRole("ADMIN", "SUPER_ADMIN")

                                                // ---------------- SUPER ADMIN ONLY ----------------
                                                .requestMatchers(
                                                                "/api/super-admin/**",
                                                                "/api/admin/invoices/*/resend",
                                                                "/api/admin/moderators/**")
                                                .hasRole("SUPER_ADMIN")

                                                // ---------------- USER ACCESS ----------------
                                                .requestMatchers("/api/cart/**", "/api/cart", "/api/orders/**",
                                                                "/api/orders")
                                                .hasRole("USER")

                                                // ---------------- FALLBACK ----------------
                                                .anyRequest().authenticated())

                                /*
                                 * ================= JWT FILTER =================
                                 * Insert custom JWT filter before Spring's authentication filter.
                                 * This ensures authentication is established early in the chain.
                                 */
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class)

                                /*
                                 * ================= DISABLE DEFAULT AUTH MECHANISMS =================
                                 * Prevent Spring Security from exposing form login or HTTP Basic auth.
                                 */
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())

                                /*
                                 * ================= EXCEPTION HANDLING =================
                                 * Handles authentication failures (e.g. missing / invalid JWT).
                                 */
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write("""
                                                                        {
                                                                          "error": "UNAUTHORIZED",
                                                                          "message": "Invalid or missing JWT token"
                                                                        }
                                                                        """);
                                                }));

                return http.build();
        }

        @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:4200,http://localhost:3000,https://accomplished-radiance-production.up.railway.app}")
        private String allowedOrigins;

        /**
         * Defines global CORS configuration.
         *
         * <p>
         * <strong>NOTE:</strong>
         * In production, allowed origins should be externalized
         * via environment-specific configuration.
         * </p>
         *
         * @return {@link CorsConfigurationSource}
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                // Use allowedOriginPatterns when allowCredentials = true
                List<String> origins = List.of(allowedOrigins.split(","));
                config.setAllowedOriginPatterns(origins);

                config.setAllowedMethods(
                                List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                config.setAllowedHeaders(
                                List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));

                // Expose headers so frontend can read them
                config.setExposedHeaders(
                                List.of("Authorization", "Content-Type"));

                config.setAllowCredentials(true);

                // Cache preflight response for 1 hour
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", config);
                return source;
        }

        /**
         * Password encoder used for hashing user credentials.
         *
         * <p>
         * BCrypt with strength 12 provides a good balance
         * between security and performance.
         * </p>
         *
         * @return {@link PasswordEncoder}
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12);
        }

        /**
         * Authentication manager bean.
         *
         * @param authenticationConfiguration Spring's authentication configuration
         * @return {@link AuthenticationManager}
         * @throws Exception in case of configuration errors
         */
        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration authenticationConfiguration) throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }
}
