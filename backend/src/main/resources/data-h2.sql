-- H2 Compatible Data Initialization

-- Clear existing data (for development only)
DELETE FROM user_roles WHERE user_id IN (1, 2);
DELETE FROM pull_requests WHERE id = 1;
DELETE FROM repos WHERE id = 1;
DELETE FROM users WHERE id IN (1, 2);
DELETE FROM roles WHERE id IN (1, 2);

-- Create roles
INSERT INTO roles (id, name) VALUES (1, 'ADMIN');
INSERT INTO roles (id, name) VALUES (2, 'USER');

-- Create admin user (password: password)
INSERT INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) 
VALUES (1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'admin@example.com', 'Admin User', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create test user (password: password)
INSERT INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) 
VALUES (2, 'user', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'user@example.com', 'Test User', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);

-- Create sample repository
INSERT INTO repos (id, name, clone_url, default_branch, created_at, updated_at)
VALUES (1, 'example/sample-repo', 'https://github.com/example/sample-repo.git', 'main', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create sample pull request
INSERT INTO pull_requests (id, repo_id, pr_number, title, description, author, source_branch, target_branch, status, created_at, updated_at)
VALUES (1, 1, 42, 'Fix critical bug in authentication', 'This PR fixes a null pointer exception in the auth module',
        'developer1', 'fix-auth-bug', 'main', 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
