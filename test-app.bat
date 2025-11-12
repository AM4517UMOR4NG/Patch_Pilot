@echo off
echo ========================================
echo Patch Pilot - Application Test
echo ========================================
echo.

echo Testing Backend Health...
curl -s http://localhost:8080/actuator/health > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running
) else (
    echo [ERROR] Backend is not accessible
)

echo.
echo Testing Frontend...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running
) else (
    echo [ERROR] Frontend is not accessible
)

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Access your application:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   Swagger UI: http://localhost:8080/swagger-ui/index.html
echo   H2 Console: http://localhost:8080/h2-console
echo.
echo Login credentials:
echo   Username: admin
echo   Password: password
echo.
pause
