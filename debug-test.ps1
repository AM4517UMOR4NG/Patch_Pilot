Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Patch Pilot Debug Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test Backend Health
Write-Host "Testing Backend Health..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -UseBasicParsing
    if ($backendHealth.StatusCode -eq 200) {
        Write-Host "✓ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend health check failed: $_" -ForegroundColor Red
}

# Test Frontend
Write-Host "Testing Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend not accessible: $_" -ForegroundColor Red
}

# Test Login API
Write-Host "Testing Login API..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    Write-Host "✓ Login API working" -ForegroundColor Green
    $token = ($loginResponse.Content | ConvertFrom-Json).token
    Write-Host "  Token generated: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Test authenticated endpoints
    Write-Host "Testing Authenticated Endpoints..." -ForegroundColor Yellow
    
    # Test Repos endpoint
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $reposResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/repos" `
            -Headers $headers `
            -UseBasicParsing
        
        Write-Host "✓ Repos endpoint working" -ForegroundColor Green
        $repos = $reposResponse.Content | ConvertFrom-Json
        Write-Host "  Found $($repos.Count) repositories" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Repos endpoint failed: $_" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Login API failed: $_" -ForegroundColor Red
}

# Test Swagger UI
Write-Host "Testing Swagger UI..." -ForegroundColor Yellow
try {
    $swaggerResponse = Invoke-WebRequest -Uri "http://localhost:8080/swagger-ui/index.html" -UseBasicParsing
    if ($swaggerResponse.StatusCode -eq 200) {
        Write-Host "✓ Swagger UI accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Swagger UI not accessible" -ForegroundColor Red
}

# Test H2 Console
Write-Host "Testing H2 Console..." -ForegroundColor Yellow
try {
    $h2Response = Invoke-WebRequest -Uri "http://localhost:8080/h2-console" -UseBasicParsing
    if ($h2Response.StatusCode -eq 200) {
        Write-Host "✓ H2 Console accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ H2 Console not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Debug Test Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "  Swagger UI: http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
Write-Host "  H2 Console: http://localhost:8080/h2-console" -ForegroundColor White
Write-Host ""
Write-Host "Credentials:" -ForegroundColor Green
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
