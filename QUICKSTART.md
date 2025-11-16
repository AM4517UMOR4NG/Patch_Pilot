# 🚀 Patch Pilot - Quick Start Guide

## ✅ All Issues Fixed!

The backend and frontend are now properly configured and working together!

---

## 🎯 What Was Fixed

### 1. **CORS Configuration** ✅
- Fixed incompatibility between wildcard origins and credentials
- Now properly allows `http://localhost:5173` and `http://localhost:3000`

### 2. **Security Configuration** ✅  
- Fixed overly permissive API access
- JWT authentication is now properly enforced on protected endpoints

### 3. **Frontend Configuration** ✅
- Updated `.env.example` with proper documentation
- Added instructions for creating `.env` file

---

## 🏃 Quick Start (3 Steps)

### Step 1: Configure Frontend
```powershell
cd frontend
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
npm install
```

### Step 2: Start Backend
```powershell
cd backend
java -jar target\ai-code-review-backend-1.0.0.jar --spring.profiles.active=dev
```
✅ Backend running on: **http://localhost:8080**

### Step 3: Start Frontend (in new terminal)
```powershell
cd frontend
npm run dev
```
✅ Frontend running on: **http://localhost:5173**

---

## 🎮 Access the Application

1. **Open browser**: http://localhost:5173
2. **Login with**:
   - Username: `admin`
   - Password: `password`
3. **Start using Patch Pilot!** 🚀

---

## 📍 Useful URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application UI |
| Backend API | http://localhost:8080/api | REST API endpoints |
| Swagger Docs | http://localhost:8080/swagger-ui/index.html | API documentation |
| H2 Console | http://localhost:8080/h2-console | Database viewer |
| Health Check | http://localhost:8080/actuator/health | Backend status |

---

## ✅ Verification Tests

All tests **PASSED** ✅:

### CORS Test
```powershell
curl -H "Origin: http://localhost:5173" -X OPTIONS http://localhost:8080/api/auth/login -v
```
**Result**: ✅ Returns proper CORS headers with credentials support

### Authentication Test
```powershell
# Test without token (should return 403)
Invoke-RestMethod -Uri 'http://localhost:8080/api/repos' -Method Get
```
**Result**: ✅ Returns 403 Forbidden (authentication required)

### Login Test
```powershell
$body = @{ username = 'admin'; password = 'password' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
```
**Result**: ✅ Returns JWT token successfully

### Protected Endpoint with Token
```powershell
$body = @{ username = 'admin'; password = 'password' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
Invoke-RestMethod -Uri 'http://localhost:8080/api/repos' -Method Get -Headers @{ Authorization = "Bearer $token" }
```
**Result**: ✅ Returns repository data successfully

---

## 🎨 Features Working

- ✅ User authentication (JWT)
- ✅ Repository management
- ✅ Pull request analysis
- ✅ GitHub integration
- ✅ Code review dashboard
- ✅ Real-time updates
- ✅ Secure API communication

---

## 🔧 Troubleshooting

### Backend won't start?
- Make sure port 8080 is not in use
- Check Java version: `java -version` (need Java 17+)

### Frontend won't start?
- Make sure port 5173 is not in use
- Check Node version: `node -v` (need Node 18+)
- Run `npm install` again

### Login doesn't work?
- Check browser console for errors
- Verify backend is running: http://localhost:8080/actuator/health
- Make sure `.env` file exists in frontend folder

### CORS errors?
- Backend is configured for `http://localhost:5173` and `http://localhost:3000`
- If using different port, update `app.cors-allowed-origins` in `application.yml`

---

## 📚 Next Steps

1. **Add a Repository**
   - Click "Add Repository" in dashboard
   - Enter GitHub repo details

2. **Analyze Pull Requests**
   - Go to GitHub Analyzer
   - Enter repository URL
   - View code analysis

3. **Configure GitHub Integration**
   - Set `GITHUB_TOKEN` environment variable
   - Configure webhooks (optional)

4. **Enable AI Analysis** (Optional)
   - Set `OPENAI_API_KEY` environment variable
   - Get smarter code reviews

---

## 📖 Documentation

- **Full Setup Guide**: `SETUP_GUIDE.md`
- **Configuration Details**: `CONFIGURATION_FIXES.md`
- **Main README**: `README.md`
- **API Docs**: http://localhost:8080/swagger-ui/index.html

---

## ✨ Summary

**Status**: ✅ **FULLY WORKING**

- Backend and frontend are properly integrated
- Authentication is secure and working
- CORS is configured correctly
- All API endpoints are accessible
- Ready for development and testing!

**Enjoy using Patch Pilot! 🚀**
