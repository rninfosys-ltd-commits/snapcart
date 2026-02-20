package com.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("Running Database Schema Fixes...");
            // Change role column to VARCHAR to support all enum values and avoid
            // truncation/enum mismatch
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20)");
            System.out.println("Database Schema Fixes executed successfully.");
        } catch (Exception e) {
            System.err.println("Error running database schema fixes: " + e.getMessage());
            // Don't throw exception to avoid stopping the app, as it might already be
            // correct
        }
    }
}
