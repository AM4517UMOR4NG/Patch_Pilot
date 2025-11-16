package com.example.aicodereview.config;

import com.example.aicodereview.entity.Role;
import com.example.aicodereview.entity.User;
import com.example.aicodereview.repository.RoleRepository;
import com.example.aicodereview.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Set;

@Configuration
public class DataInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                   RoleRepository roleRepository, 
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            logger.info("Initializing database with default users...");
            
            // Create roles
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("ADMIN");
                        return roleRepository.save(role);
                    });
            
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("USER");
                        return roleRepository.save(role);
                    });
            
            // Create admin user
            if (!userRepository.findByUsername("admin").isPresent()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setEmail("admin@example.com");
                admin.setFullName("Admin User");
                admin.setEnabled(true);
                admin.setCreatedAt(LocalDateTime.now());
                admin.setUpdatedAt(LocalDateTime.now());
                admin.setRoles(Set.of(adminRole, userRole));
                
                userRepository.save(admin);
                logger.info("Created admin user: admin/password");
            }
            
            // Create test user
            if (!userRepository.findByUsername("user").isPresent()) {
                User testUser = new User();
                testUser.setUsername("user");
                testUser.setPassword(passwordEncoder.encode("password"));
                testUser.setEmail("user@example.com");
                testUser.setFullName("Test User");
                testUser.setEnabled(true);
                testUser.setCreatedAt(LocalDateTime.now());
                testUser.setUpdatedAt(LocalDateTime.now());
                testUser.setRoles(Set.of(userRole));
                
                userRepository.save(testUser);
                logger.info("Created test user: user/password");
            }
            
            logger.info("Database initialization completed!");
        };
    }
}
