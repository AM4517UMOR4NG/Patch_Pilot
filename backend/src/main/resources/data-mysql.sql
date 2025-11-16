-- MySQL Compatible Data Initialization

-- Create roles
INSERT IGNORE INTO roles (id, name) VALUES (1, 'ADMIN');
INSERT IGNORE INTO roles (id, name) VALUES (2, 'USER');

-- Create admin user (password: password)
INSERT IGNORE INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) 
VALUES (1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'admin@example.com', 'Admin User', true, NOW(), NOW());

-- Create test user (password: password)
INSERT IGNORE INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) 
VALUES (2, 'user', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'user@example.com', 'Test User', true, NOW(), NOW());

-- Assign roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 2);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (2, 2);

-- Create sample repository
INSERT IGNORE INTO repos (id, name, clone_url, default_branch, created_at, updated_at)
VALUES (1, 'example/sample-repo', 'https://github.com/example/sample-repo.git', 'main', 
        NOW(), NOW());

-- Create sample pull request
INSERT IGNORE INTO pull_requests (id, repo_id, pr_number, title, description, author, source_branch, target_branch, status, created_at, updated_at)
VALUES (1, 1, 42, 'Fix critical bug in authentication', 'This PR fixes a null pointer exception in the auth module',
        'developer1', 'fix-auth-bug', 'main', 'open', NOW(), NOW());
