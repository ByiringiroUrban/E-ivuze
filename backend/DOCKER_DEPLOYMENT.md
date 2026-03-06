# Docker Deployment Guide - Backend Only

This guide explains how to deploy the **E-ivuzeConnect Backend** using Docker. The frontend should be deployed separately.

## Prerequisites

- **Docker Desktop** installed and running on your system
  - Download from: https://www.docker.com/products/docker-desktop
  - Make sure Docker Desktop is running before executing commands
- Docker Compose (included with Docker Desktop)
- MongoDB database (Atlas, local, or containerized)

### Windows Setup
If you're on Windows, use the provided `docker-run.bat` helper script:
```cmd
# Navigate to backend directory
cd backend

# Run the helper script
docker-run.bat
```

This script provides a menu to:
- Build the backend image
- Run containers
- Manage Docker Compose
- View logs

## Architecture

- **Backend Container**: Express.js API server (Port 4000)
- **Database**: MongoDB (external or containerized)
- **Frontend**: Deploy separately (Vercel, Netlify, etc.)

## Quick Start

### 1. Build and Run Backend with Docker

```bash
# From project root, navigate to backend directory
cd backend

# Build the backend Docker image
docker build -t E-ivuze-backend .

# Run the backend container
docker run -p 4000:4000 \
  -e MONGODB_URI="your_mongodb_connection_string" \
  -e JWT_SECRET="your_jwt_secret" \
  -e EMAIL_HOST="smtp.gmail.com" \
  -e EMAIL_USER="your_email@gmail.com" \
  -e EMAIL_PASS="your_app_password" \
  -e EMAIL_FROM="noreply@E-ivuze.com" \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  E-ivuze-backend
```

### 2. Run with Docker Compose (Recommended)

```bash
# From project root, navigate to backend directory
cd backend

# Copy environment variables template
cp env.example .env
# Edit .env with your actual values

# Run backend only
docker-compose up -d backend

# Or run with MongoDB
docker-compose --profile with-db up -d
```

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Copy the example file
cp env.example .env

# Edit with your actual values
# Required: MONGODB_URI and JWT_SECRET
# Optional: Email settings (defaults provided)
```

### Required Variables:
```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onehealth

# Authentication (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_here
```

### Optional Variables (with defaults):
```env
# Email Configuration (Optional - defaults are already set in code)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=E-ivuzeconnect@gmail.com
EMAIL_PASS=xdom dbrr ldxy swqu
EMAIL_FROM=No Reply <no-reply@E-ivuze.com>

# Application URLs
VITE_FRONTEND_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Note:** If you see warnings about unset environment variables, copy `env.example` to `.env` and fill in your values.

## Docker Commands

### Build Backend Image
```bash
cd backend
docker build -t E-ivuze-backend .
```

### Run Backend Container
```bash
cd backend
docker run -d \
  --name E-ivuze-backend \
  -p 4000:4000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  E-ivuze-backend
```

### View Backend Logs
```bash
docker logs E-ivuze-backend
```

### Stop Backend Container
```bash
docker stop E-ivuze-backend
docker rm E-ivuze-backend
```

## Docker Compose Commands

### Start Services
```bash
cd backend
# Start only the backend
docker-compose up -d backend

# Start backend with MongoDB
docker-compose --profile with-db up -d

# Start with Redis (if needed)
docker-compose --profile with-redis up -d
```

### View Backend Logs
```bash
cd backend
docker-compose logs -f backend
```

### Stop Services
```bash
cd backend
docker-compose down
```

### Rebuild and Restart Backend
```bash
cd backend
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Production Deployment

### 1. Environment Variables
Ensure all required environment variables are set in your deployment platform:

- **MongoDB Atlas**: Set `MONGODB_URI`
- **JWT Secret**: Generate a secure random string
- **Email**: Configure SMTP settings (optional - defaults provided)
- **Domain**: Set `VITE_FRONTEND_URL` to your domain

### 2. Health Checks
The container includes health checks that monitor:
- Application responsiveness
- Database connectivity
- Email service availability

### 3. Security
- Non-root user execution
- Minimal attack surface
- Environment variable configuration

## Troubleshooting

### Docker Desktop Not Running (Windows)
```cmd
ERROR: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping"

Solution:
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Wait for Docker to fully start up
4. Try the commands again
```

### Environment Variable Warnings
```bash
time="..." level=warning msg="The \"EMAIL_HOST\" variable is not set. Defaulting to a blank string."

Solution:
1. Copy the example environment file: cp env.example .env
2. Edit .env with your actual values
3. Required: MONGODB_URI and JWT_SECRET
4. Email variables are optional (defaults provided in code)
```

### Obsolete Docker Compose Version Warning
```bash
the attribute `version` is obsolete, it will be ignored

Solution: The version field has been removed from docker-compose.yml - this warning can be ignored.
```

### Container Won't Start
```bash
# Check logs
docker logs E-ivuze-backend

# Check if port 4000 is available
netstat -an | findstr :4000
```

### Database Connection Issues
```bash
# Test backend health
docker exec E-ivuze-backend curl -f http://localhost:4000/api/public/settings
```

### Permission Issues (Linux/Mac)
```bash
# Fix volume permissions
sudo chown -R 1001:nodejs backend/uploads backend/logs
```

### Build Context Issues
```bash
# Make sure you're in the correct directory
cd backend

# Check if Dockerfile exists
ls -la Dockerfile
```

## File Structure

```
backend/
├── Dockerfile              # Main Docker configuration
├── docker-compose.yml      # Multi-service setup
├── .dockerignore          # Files to exclude from build
├── env.example            # Environment variables template
├── DOCKER_DEPLOYMENT.md   # This documentation
├── package.json           # Backend dependencies
├── server.js              # Main application file
├── utils/                 # Utility functions
├── controllers/           # API controllers
├── models/                # Database models
├── routes/                # API routes
├── middleware/            # Express middleware
└── uploads/               # File uploads (mounted volume)
```

## Support

For deployment issues:
1. Check container logs: `docker logs <container_name>`
2. Verify environment variables are set correctly
3. Test database connectivity
4. Check network configuration
5. Ensure volumes are properly mounted

## Performance Optimization

- **Multi-stage builds**: Keep image size small
- **Layer caching**: Dependencies installed first
- **Health checks**: Automatic container monitoring
- **Connection pooling**: Optimized database connections
- **Non-root user**: Enhanced security
