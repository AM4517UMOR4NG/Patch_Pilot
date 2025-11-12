@echo off
echo Building backend...

REM Download Maven if needed and build
java -jar .mvn\wrapper\maven-wrapper.jar clean package -DskipTests

if exist target\ai-code-review-backend-1.0.0.jar (
    echo.
    echo Starting backend with H2 database...
    echo Backend will be available at: http://localhost:8080
    echo Swagger UI: http://localhost:8080/swagger-ui/index.html
    echo H2 Console: http://localhost:8080/h2-console (username: sa, no password)
    echo.
    java -jar target\ai-code-review-backend-1.0.0.jar --spring.profiles.active=h2
) else (
    echo Build failed. Trying alternative...
    echo Please make sure Java 17 is installed.
)
pause
