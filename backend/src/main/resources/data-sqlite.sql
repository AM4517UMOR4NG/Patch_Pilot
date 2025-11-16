-- SQLite Compatible Data Initialization

-- Create roles
INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'ADMIN');
INSERT OR IGNORE INTO roles (id, name) VALUES (2, 'USER');

-- Create admin user (password: password)
INSERT OR IGNORE INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) 
VALUES (1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'admin@example.com', 'Admin User', 1, datetime('now'), datetime('now'));

-- Create test user (password: password)
INSERT OR IGNORE INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) 
VALUES (2, 'user', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'user@example.com', 'Test User', 1, datetime('now'), datetime('now'));

-- Assign roles
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (1, 2);
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (2, 2);

-- Create sample repository
INSERT OR IGNORE INTO repos (id, name, clone_url, default_branch, created_at, updated_at)
VALUES (1, 'example/sample-repo', 'https://github.com/example/sample-repo.git', 'main', 
        datetime('now'), datetime('now'));

-- Create sample pull request
INSERT OR IGNORE INTO pull_requests (id, repo_id, pr_number, title, description, author, source_branch, target_branch, status, created_at, updated_at)
VALUES (1, 1, 42, 'Fix critical bug in authentication', 'This PR fixes a null pointer exception in the auth module',
        'developer1', 'fix-auth-bug', 'main', 'open', datetime('now'), datetime('now'));
