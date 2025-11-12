# PowerShell script to build and run backend
$mavenVersion = "3.9.6"
$mavenDir = "$PSScriptRoot\maven"
$mavenBin = "$mavenDir\apache-maven-$mavenVersion\bin"

# Download Maven if not present
if (-not (Test-Path "$mavenBin\mvn.cmd")) {
    Write-Host "Downloading Maven..." -ForegroundColor Cyan
    $mavenUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
    $zipFile = "$PSScriptRoot\maven.zip"
    
    Invoke-WebRequest -Uri $mavenUrl -OutFile $zipFile
    Expand-Archive -Path $zipFile -DestinationPath $mavenDir -Force
    Remove-Item $zipFile
}

# Build the project
Write-Host "Building backend..." -ForegroundColor Green
& "$mavenBin\mvn.cmd" clean package -DskipTests

# Run the application
if (Test-Path "target\ai-code-review-backend-1.0.0.jar") {
    Write-Host "`nStarting backend with H2 database..." -ForegroundColor Green
    Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "Swagger UI: http://localhost:8080/swagger-ui/index.html" -ForegroundColor Cyan
    Write-Host "H2 Console: http://localhost:8080/h2-console" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    
    java -jar target\ai-code-review-backend-1.0.0.jar --spring.profiles.active=h2
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
