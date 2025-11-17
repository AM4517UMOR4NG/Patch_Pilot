# ⚡ Patch Pilot - Quick Start Guide

Get up and running in **5 minutes**!

---

## 🎯 Prerequisites

- ✅ Docker Desktop installed and running
- ✅ 4GB RAM available
- ✅ Ports 3000, 8080, 5432 free

---

## 🚀 Installation (3 Steps)

### Step 1: Clone & Navigate
```bash
git clone https://github.com/yourusername/Patch_Pilot.git
cd Patch_Pilot
```

### Step 2: Start Services
```bash
docker-compose up --build
```

**Wait 2-3 minutes** for all services to initialize.

### Step 3: Open Browser
```
http://localhost:3000
```

✅ **Done!** You should see the Patch Pilot homepage.

---

## 🎮 Quick Test

1. Click **"Analysis"** in the navigation
2. Paste this URL:
   ```
   https://github.com/AM4517UMOR4NG/CashierSimpleSystem
   ```
3. Click **"Start Deep Analysis"**
4. Watch the magic happen! ✨

---

## 📊 What You Get

### Analysis Page
- Enter any public GitHub repository URL
- Get real-time code analysis
- See security vulnerabilities, performance issues, code quality problems

### Dashboard
- View all past analyses
- Filter by repository
- Track analysis history

### AI Insights
- Code health metrics
- AI-powered recommendations
- Quality trends

---

## 🔗 URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Web Interface |
| **Backend API** | http://localhost:8080 | REST API |
| **API Health** | http://localhost:8080/actuator/health | Health Check |
| **Database** | localhost:5432 | PostgreSQL |

---

## 🎯 Sample Repositories to Test

Try analyzing these:

```
https://github.com/AM4517UMOR4NG/CashierSimpleSystem
https://github.com/AM4517UMOR4NG/Landing-Pages
https://github.com/AM4517UMOR4NG/UKF-Tennis-Meja
```

---

## 🛑 Stop Services

```bash
# Stop everything
docker-compose down

# Stop and clear all data
docker-compose down -v
```

---

## 🆘 Troubleshooting

### Service won't start?
```bash
# Check Docker is running
docker info

# Restart everything
docker-compose down
docker-compose up --build
```

### Port already in use?
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Can't see results?
```bash
# Check logs
docker-compose logs -f backend

# Check database
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT COUNT(*) FROM findings;"
```

---

## 📝 Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Check status
docker-compose ps

# Clear database
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview -c "
DELETE FROM suggested_patches;
DELETE FROM findings;
DELETE FROM runs;
DELETE FROM pull_requests;
DELETE FROM repos;
"
```

---

## 🎓 Next Steps

1. ✅ Analyze your own repository
2. ✅ Explore the Dashboard
3. ✅ Check AI Insights
4. ✅ Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for advanced setup
5. ✅ Read [README.md](README.md) for full documentation

---

## 💡 Tips

- **Use HTTPS URLs**: `https://github.com/owner/repo`
- **Public repos only**: Private repos require authentication
- **Wait for completion**: Analysis takes 30-60 seconds depending on repo size
- **Check Dashboard**: All results are saved and can be viewed later

---

## 🎉 You're Ready!

Start analyzing your code and get instant insights! 🚀

**Need help?** Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.
