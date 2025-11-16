-- Create roles
MERGE INTO roles (id, name) KEY(id) VALUES (1, 'ADMIN');
MERGE INTO roles (id, name) KEY(id) VALUES (2, 'USER');

-- Create admin user (password: password)
MERGE INTO users (id, username, password, email, full_name, enabled, created_at, updated_at)
KEY(id)
VALUES (1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'admin@example.com', 'Admin User', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create test user (password: password)
MERGE INTO users (id, username, password, email, full_name, enabled, created_at, updated_at)
KEY(id)
VALUES (2, 'user', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 
        'user@example.com', 'Test User', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign roles
MERGE INTO user_roles (user_id, role_id) KEY(user_id, role_id) VALUES (1, 1);
MERGE INTO user_roles (user_id, role_id) KEY(user_id, role_id) VALUES (1, 2);
MERGE INTO user_roles (user_id, role_id) KEY(user_id, role_id) VALUES (2, 2);

-- Create sample repository
MERGE INTO repos (id, name, clone_url, default_branch, created_at, updated_at)
KEY(id)
VALUES (1, 'example/sample-repo', 'https://github.com/example/sample-repo.git', 'main', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Ensure identity continues after seed (avoid PK collisions on inserts)
ALTER TABLE repos ALTER COLUMN id RESTART WITH 100;

-- Create sample pull request
MERGE INTO pull_requests (id, repo_id, pr_number, title, description, author, source_branch, target_branch, status, created_at, updated_at)
KEY(id)
VALUES (1, 1, 42, 'Fix critical bug in authentication', 'This PR fixes a null pointer exception in the auth module',
        'developer1', 'fix-auth-bug', 'main', 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Also bump identity for pull_requests
ALTER TABLE pull_requests ALTER COLUMN id RESTART WITH 100;
