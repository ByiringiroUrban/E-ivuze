@echo off
REM E-ivuzeBackend Docker Helper Script
REM This script helps run Docker commands for the backend

echo E-ivuzeBackend Docker Helper
echo ===================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo Please start Docker Desktop and try again.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Docker is running. Available commands:
echo.
echo 1. Build backend image
echo 2. Run backend container
echo 3. Run with Docker Compose (backend only)
echo 4. Run with Docker Compose + MongoDB
echo 5. Stop all containers
echo 6. View backend logs
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo Building backend Docker image...
    docker build -t E-ivuze-backend .
    goto end
)

if "%choice%"=="2" (
    echo Running backend container...
    docker run -d --name E-ivuze-backend -p 4000:4000 --env-file .env -v "%cd%/uploads:/app/uploads" -v "%cd%/logs:/app/logs" E-ivuze-backend
    echo Backend container started on port 4000
    goto end
)

if "%choice%"=="3" (
    echo Starting backend with Docker Compose...
    docker-compose up -d backend
    goto end
)

if "%choice%"=="4" (
    echo Starting backend with MongoDB...
    docker-compose --profile with-db up -d
    goto end
)

if "%choice%"=="5" (
    echo Stopping all containers...
    docker-compose down
    docker stop E-ivuze-backend 2>nul
    docker rm E-ivuze-backend 2>nul
    goto end
)

if "%choice%"=="6" (
    echo Showing backend logs...
    docker-compose logs -f backend
    goto end
)

echo Invalid choice. Please run the script again.
:end
echo.
echo Press any key to exit...
pause >nul


