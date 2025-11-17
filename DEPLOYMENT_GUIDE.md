# 🚀 Patch Pilot - Complete Deployment Guide

This guide provides step-by-step instructions for running Patch Pilot in different environments.

---

## 📋 Table of Contents

1. [Quick Start (Docker)](#-quick-start-docker---5-minutes)
2. [Development Setup](#-development-setup)
3. [Production Deployment](#-production-deployment)
4. [Database Setup](#-database-setup)
5. [Testing](#-testing-the-application)
6. [Common Commands](#-common-commands)

---

## 🐳 Quick Start (Docker) - 5 Minutes

### Prerequisites
- Docker Desktop installed and running
- 4GB RAM available
- Port 3000, 8080, and 5432 available

### Steps

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Patch_Pilot.git
cd Patch_Pilot
```

#### 2. Start Everything
```bash
docker-compose up --build
```

**Wait 2-3 minutes for all services to start.**

#### 3. Verify Services

Open your browser and check:
- ✅ **Frontend**: http://localhost:3000 (should show Patch Pilot homepage)
- ✅ **Backend API**: http://localhost:8080/actuator/health (should return `{"status":"UP"}`)
- ✅ **Database**: Running on localhost:5432

#### 4. Test Analysis

1. Go to http://localhost:3000
2. Click on **"Analysis"** page
3. Enter: `https://github.com/AM4517UMOR4NG/CashierSimpleSystem`
4. Click **"Start Deep Analysis"**
5. View real-time results! 🎉

#### 5. Stop Services

```bash
# Stop but keep data
docker-compose down

# Stop and remove all data (clean slate)
docker-compose down -v
```

---

## 💻 Development Setup

### Backend (Spring Boot)

#### 1. Install Prerequisites
- **Java 17** or higher
- **PostgreSQL 15** (or use Docker for just DB)
- **Maven** (or use included mvnw)

#### 2. Setup Database

**Option A: Docker PostgreSQL** (Recommended)
```bash
docker run -d \
  --name patch-pilot-db \
  -e POSTGRES_DB=aicodereview \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

**Option B: Local PostgreSQL**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE aicodereview;

-- Create user (if needed)
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE aicodereview TO postgres;
```

#### 3. Configure Backend

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  profiles:
    active: local  # Use 'local' profile for development

  datasource:
    url: jdbc:postgresql://localhost:5432/aicodereview
    username: postgres
    password: postgres
    
  jpa:
    hibernate:
      ddl-auto: update  # Auto-create tables
```

#### 4. Run Backend

**Windows:**
```powershell
cd backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Backend will start at **http://localhost:8080**

#### 5. Verify Backend

```bash
# Check health
curl http://localhost:8080/actuator/health

# Should return:
# {"status":"UP"}
```

---

### Frontend (React + TypeScript)

#### 1. Install Prerequisites
- **Node.js 18** or higher
- **npm** or **yarn**

#### 2. Install Dependencies

```bash
cd frontend
npm install
```

#### 3. Configure API Endpoint

The frontend is already configured to connect to `http://localhost:8080`.

If you need to change it, edit `frontend/src/pages/AnalysisPage.tsx`:

```typescript
// Change this line if your backend is on a different URL
const response = await fetch('http://localhost:8080/api/analysis/analyze', {
```

#### 4. Run Frontend

**Development Mode:**
```bash
npm run dev
```

Frontend will start at **http://localhost:3000**

**Production Build:**
```bash
npm run build
npm run preview
```

#### 5. Verify Frontend

1. Open http://localhost:3000
2. You should see the Patch Pilot homepage
3. Navigate through different pages (Analysis, Dashboard, AI Insights)

---

## 🌐 Production Deployment

### Option 1: Docker Compose (Recommended)

#### 1. Prepare Environment

Create `.env` file in project root:

```env
# Database
POSTGRES_DB=aicodereview
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here

# Backend
SPRING_PROFILES_ACTIVE=prod
OPENAI_API_KEY=your-openai-api-key-here

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000
DB_PORT=5432
```

#### 2. Update docker-compose.yml

```yaml
services:
  backend:
    environment:
      - SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
    
  frontend:
    restart: unless-stopped
    
  db:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data  # Persistent storage
```

#### 3. Deploy

```bash
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### 4. Backup Database

```bash
# Backup
docker exec patch_pilot-db-1 pg_dump -U postgres aicodereview > backup.sql

# Restore
cat backup.sql | docker exec -i patch_pilot-db-1 psql -U postgres aicodereview
```

---

### Option 2: Manual Production Deployment

#### Backend Deployment

1. **Build JAR:**
```bash
cd backend
./mvnw clean package -DskipTests
```

2. **Run JAR:**
```bash
java -jar target/ai-code-review-1.0.0.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:postgresql://your-db-host:5432/aicodereview \
  --spring.datasource.username=postgres \
  --spring.datasource.password=your-password
```

#### Frontend Deployment

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Deploy dist folder** to your web server (Nginx, Apache, etc.)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/patch-pilot/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🗄️ Database Setup

### Schema Overview

The application will auto-create these tables:
- `repos` - Repository information
- `pull_requests` - PR data
- `runs` - Analysis runs
- `findings` - Code issues found
- `suggested_patches` - AI-generated fixes

### Manual Schema Creation

If needed, create tables manually:

```sql
-- Connect to database
psql -U postgres -d aicodereview

-- Tables will be auto-created by Hibernate
-- But you can initialize with:
\i backend/src/main/resources/schema.sql
```

### Database Maintenance

```bash
# Access database
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview

# View tables
\dt

# Count records
SELECT COUNT(*) FROM findings;
SELECT COUNT(*) FROM repos;

# Clear all data (CAUTION!)
TRUNCATE TABLE suggested_patches CASCADE;
TRUNCATE TABLE findings CASCADE;
TRUNCATE TABLE runs CASCADE;
TRUNCATE TABLE pull_requests CASCADE;
TRUNCATE TABLE repos CASCADE;

# View recent analyses
SELECT r.name, ru.status, ru.started_at, COUNT(f.id) as issues
FROM repos r
JOIN pull_requests pr ON pr.repo_id = r.id
JOIN runs ru ON ru.pull_request_id = pr.id
LEFT JOIN findings f ON f.run_id = ru.id
GROUP BY r.id, ru.id
ORDER BY ru.started_at DESC
LIMIT 10;
```

---

## 🧪 Testing the Application

### 1. Test with Sample Repositories

```bash
# Test with a small repo
curl -X POST http://localhost:8080/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"prUrl":"https://github.com/AM4517UMOR4NG/CashierSimpleSystem"}'

# Test with a larger repo
curl -X POST http://localhost:8080/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"prUrl":"https://github.com/AM4517UMOR4NG/Landing-Pages"}'
```

### 2. Verify Results

```bash
# Check database
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview

# Query results
SELECT COUNT(*) as total_issues FROM findings;
SELECT category, COUNT(*) FROM findings GROUP BY category;
```

### 3. Test Frontend

1. Open http://localhost:3000
2. Navigate to "Analysis"
3. Enter a GitHub URL
4. Click "Start Deep Analysis"
5. Verify results appear
6. Check "Dashboard" for saved analyses
7. Check "AI Insights" for metrics

---

## 📝 Common Commands

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start with rebuild
docker-compose up --build -d

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart a service
docker-compose restart backend

# Check status
docker-compose ps

# Execute command in container
docker exec -it patch_pilot-backend-1 bash
```

### Database Commands

```bash
# Backup database
docker exec patch_pilot-db-1 pg_dump -U postgres aicodereview > backup_$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker exec -i patch_pilot-db-1 psql -U postgres aicodereview

# Connect to database
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview

# Clear all data
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "
DELETE FROM suggested_patches;
DELETE FROM findings;
DELETE FROM runs;
DELETE FROM pull_requests;
DELETE FROM repos;
"
```

### Backend Commands

```bash
# Build
cd backend
./mvnw clean install

# Run tests
./mvnw test

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Package
./mvnw package -DskipTests

# View logs (Docker)
docker logs patch_pilot-backend-1 --tail 100 -f
```

### Frontend Commands

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

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🔍 Monitoring

### Check Service Health

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Check all containers
docker ps

# Resource usage
docker stats
```

### View Application Logs

```bash
# All services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100

# Specific service
docker-compose logs -f backend | grep ERROR
```

---

## 🆘 Getting Help

### Issue: Services won't start

```bash
# Check Docker is running
docker info

# Check ports are available
netstat -an | grep "3000\|8080\|5432"

# Restart Docker
# Windows/Mac: Restart Docker Desktop
# Linux: sudo systemctl restart docker
```

### Issue: Can't connect to database

```bash
# Check database is running
docker ps | grep postgres

# Check database logs
docker logs patch_pilot-db-1

# Restart database
docker-compose restart db
```

### Issue: Backend errors

```bash
# View full logs
docker logs patch_pilot-backend-1 --tail 200

# Check Java version in container
docker exec patch_pilot-backend-1 java -version

# Rebuild backend
docker-compose up --build backend
```

### Issue: Frontend errors

```bash
# Check Node version
node --version

# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Rebuild Docker image
docker-compose up --build frontend
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Docker containers are running: `docker ps`
- [ ] Backend health check: `curl http://localhost:8080/actuator/health`
- [ ] Frontend loads: http://localhost:3000
- [ ] Database is accessible: `docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview`
- [ ] Can analyze a repository through web UI
- [ ] Results appear in Dashboard
- [ ] AI Insights page loads
- [ ] No errors in logs: `docker-compose logs`

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎉 You're Ready!

Your Patch Pilot installation is now complete. Start analyzing repositories! 🚀
