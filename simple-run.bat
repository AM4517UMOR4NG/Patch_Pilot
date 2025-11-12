@echo off
echo ===================================
echo AI Code Review - Simple Dev Setup
echo ===================================
echo.

echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker is ready!
    echo Starting backend and database with Docker...
    docker-compose -f docker-compose.dev.yml up -d
    
    echo Waiting for backend to start...
    timeout /t 15 >nul
    
    echo.
    echo Backend should be running at: http://localhost:8080
    echo Swagger UI: http://localhost:8080/swagger-ui/index.html
) else (
    echo Docker is not ready yet.
    echo.
    echo Please wait for Docker Desktop to fully start (the whale icon should be stable)
    echo Then run this script again.
    echo.
    echo Alternative: If you have Maven installed, you can run:
    echo   cd backend
    echo   mvn spring-boot:run -Dspring-profiles.active=h2
)

echo.
echo Frontend is already running at: http://localhost:5173
echo.
echo Default login credentials:
echo   Username: admin
echo   Password: password
echo.
pause
