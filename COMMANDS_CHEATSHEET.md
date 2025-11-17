# 📋 Patch Pilot - Commands Cheat Sheet

Quick reference for all common commands.

---

## 🐳 Docker Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start with rebuild
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### View Logs

```bash
# All services (follow mode)
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last N lines
docker-compose logs --tail 100

# Without follow mode
docker-compose logs

# With timestamps
docker-compose logs -f -t
```

### Service Management

```bash
# Check status
docker-compose ps

# View resource usage
docker stats

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Execute command in container
docker exec -it patch_pilot-backend-1 bash
docker exec -it patch_pilot-frontend-1 sh
docker exec -it patch_pilot-db-1 bash
```

---

## 🗄️ Database Commands

### Access Database

```bash
# Connect to PostgreSQL
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview

# One-line query
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT COUNT(*) FROM findings;"
```

### Common Queries

```sql
-- Inside psql

-- List all tables
\dt

-- Table structure
\d repos
\d findings

-- Count records
SELECT COUNT(*) FROM repos;
SELECT COUNT(*) FROM findings;
SELECT COUNT(*) FROM runs;

-- View recent analyses
SELECT r.name, ru.status, ru.started_at, COUNT(f.id) as issues
FROM repos r
JOIN pull_requests pr ON pr.repo_id = r.id
JOIN runs ru ON ru.pull_request_id = pr.id
LEFT JOIN findings f ON f.run_id = ru.id
GROUP BY r.id, ru.id
ORDER BY ru.started_at DESC
LIMIT 10;

-- View findings by severity
SELECT severity, COUNT(*) 
FROM findings 
GROUP BY severity;

-- View findings by category
SELECT category, COUNT(*) 
FROM findings 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- Exit psql
\q
```

### Clear Data

```bash
# Clear all data (CAUTION!)
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "
DELETE FROM suggested_patches;
DELETE FROM findings;
DELETE FROM runs;
DELETE FROM pull_requests;
DELETE FROM repos;
"

# Clear specific repository data
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "
DELETE FROM suggested_patches WHERE finding_id IN (SELECT id FROM findings WHERE run_id IN (SELECT id FROM runs WHERE pull_request_id IN (SELECT id FROM pull_requests WHERE repo_id IN (SELECT id FROM repos WHERE name = 'owner/repo'))));
DELETE FROM findings WHERE run_id IN (SELECT id FROM runs WHERE pull_request_id IN (SELECT id FROM pull_requests WHERE repo_id IN (SELECT id FROM repos WHERE name = 'owner/repo')));
DELETE FROM runs WHERE pull_request_id IN (SELECT id FROM pull_requests WHERE repo_id IN (SELECT id FROM repos WHERE name = 'owner/repo'));
DELETE FROM pull_requests WHERE repo_id IN (SELECT id FROM repos WHERE name = 'owner/repo');
DELETE FROM repos WHERE name = 'owner/repo';
"
```

### Backup & Restore

```bash
# Backup database
docker exec patch_pilot-db-1 pg_dump -U postgres aicodereview > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
cat backup.sql | docker exec -i patch_pilot-db-1 psql -U postgres aicodereview

# Backup with compression
docker exec patch_pilot-db-1 pg_dump -U postgres aicodereview | gzip > backup.sql.gz

# Restore from compressed backup
gunzip -c backup.sql.gz | docker exec -i patch_pilot-db-1 psql -U postgres aicodereview
```

---

## 🔧 Backend Commands

### Development (Local)

```bash
cd backend

# Build project (Windows)
.\mvnw.cmd clean install

# Build project (Linux/Mac)
./mvnw clean install

# Run application (Windows)
.\mvnw.cmd spring-boot:run

# Run application (Linux/Mac)
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Run tests
./mvnw test

# Skip tests and build
./mvnw package -DskipTests

# Clean build
./mvnw clean package
```

### Docker Backend

```bash
# View logs
docker logs patch_pilot-backend-1 --tail 100 -f

# Restart backend
docker-compose restart backend

# Rebuild and restart
docker-compose up --build backend -d

# Execute command in backend container
docker exec -it patch_pilot-backend-1 bash

# Check Java version
docker exec patch_pilot-backend-1 java -version
```

---

## 🎨 Frontend Commands

### Development (Local)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Frontend

```bash
# View logs
docker logs patch_pilot-frontend-1 --tail 100 -f

# Restart frontend
docker-compose restart frontend

# Rebuild and restart
docker-compose up --build frontend -d

# Access frontend container
docker exec -it patch_pilot-frontend-1 sh
```

---

## 🧪 Testing Commands

### API Testing

```bash
# Health check
curl http://localhost:8080/actuator/health

# Analyze repository
curl -X POST http://localhost:8080/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"prUrl":"https://github.com/username/repo"}'

# Get analysis progress
curl http://localhost:8080/api/analysis/progress/{runId}

# Get findings
curl http://localhost:8080/api/analysis/findings/{runId}

# Windows PowerShell
$body = @{prUrl = 'https://github.com/username/repo'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8080/api/analysis/analyze' -Method Post -ContentType 'application/json' -Body $body
```

### Database Testing

```bash
# Check connection
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT 1;"

# Count findings for recent run
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "
SELECT run_id, COUNT(*) as total_findings 
FROM findings 
GROUP BY run_id 
ORDER BY run_id DESC 
LIMIT 5;
"

# View recent repositories
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "
SELECT id, name, created_at 
FROM repos 
ORDER BY created_at DESC 
LIMIT 10;
"
```

---

## 🔍 Debugging Commands

### Check Service Status

```bash
# All containers
docker ps

# Specific service
docker ps | grep backend
docker ps | grep frontend
docker ps | grep postgres

# Container resource usage
docker stats

# Docker system info
docker info

# Disk usage
docker system df
```

### Inspect Containers

```bash
# Inspect container details
docker inspect patch_pilot-backend-1
docker inspect patch_pilot-frontend-1
docker inspect patch_pilot-db-1

# View container environment variables
docker exec patch_pilot-backend-1 env

# Check container processes
docker top patch_pilot-backend-1
```

### Network Debugging

```bash
# List networks
docker network ls

# Inspect network
docker network inspect patch_pilot_default

# Test connectivity (from backend to db)
docker exec patch_pilot-backend-1 ping patch_pilot-db-1

# Check listening ports
netstat -tuln | grep "3000\|8080\|5432"
```

---

## 🧹 Cleanup Commands

### Remove Everything

```bash
# Stop and remove containers, networks
docker-compose down

# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove specific images
docker rmi patch_pilot-backend
docker rmi patch_pilot-frontend

# Remove volumes
docker volume rm patch_pilot_postgres-data
```

### Clean Build

```bash
# Backend clean build
cd backend
./mvnw clean install

# Frontend clean build
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Docker clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Monitoring Commands

### Resource Usage

```bash
# Real-time stats
docker stats

# Memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"

# CPU usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}"
```

### Log Analysis

```bash
# Search for errors in logs
docker-compose logs | grep ERROR
docker-compose logs backend | grep Exception

# Count errors
docker-compose logs backend | grep -c ERROR

# Watch logs for specific pattern
docker-compose logs -f backend | grep "Analysis"
```

---

## ⚙️ Configuration Commands

### Environment Variables

```bash
# View backend environment
docker exec patch_pilot-backend-1 printenv

# Set environment variable
docker-compose up -d -e OPENAI_API_KEY=your-key-here

# Use .env file
echo "POSTGRES_PASSWORD=secure-password" > .env
docker-compose up -d
```

### Port Changes

```bash
# Edit docker-compose.yml to change ports
# Then restart
docker-compose down
docker-compose up -d

# Check port mappings
docker-compose ps
docker port patch_pilot-backend-1
docker port patch_pilot-frontend-1
```

---

## 🚀 Quick Actions

### Full Reset

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Update Code and Restart

```bash
git pull
docker-compose down
docker-compose up --build -d
```

### View Everything

```bash
docker-compose ps
docker-compose logs --tail 50
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT COUNT(*) FROM findings;"
```

### Emergency Stop

```bash
docker stop $(docker ps -aq)
docker-compose down -v
```

---

## 📱 One-Liner Commands

```bash
# Complete setup
git clone <repo> && cd Patch_Pilot && docker-compose up --build -d

# Quick test
curl http://localhost:8080/actuator/health && echo " Backend OK" || echo " Backend FAIL"

# Clear and restart
docker-compose down -v && docker-compose up --build -d

# View all logs
docker-compose logs -f | grep -E "ERROR|Exception|WARN"

# Backup everything
docker exec patch_pilot-db-1 pg_dump -U postgres aicodereview > backup_$(date +%Y%m%d).sql && echo "Backup complete"

# Quick status check
echo "Frontend: $(curl -s http://localhost:3000 > /dev/null && echo OK || echo FAIL)" && echo "Backend: $(curl -s http://localhost:8080/actuator/health | grep -q UP && echo OK || echo FAIL)"
```

---

## 🎯 Frequently Used

```bash
# Daily use
docker-compose up -d                    # Start
docker-compose logs -f backend          # View logs
docker-compose restart backend          # Restart after code change

# Database check
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT COUNT(*) FROM findings;"

# Full restart
docker-compose down && docker-compose up --build -d

# Clean slate
docker-compose down -v && docker-compose up --build -d
```

---

Save this file for quick reference! 🚀
