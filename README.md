# 🚀 Patch Pilot

<div align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-green?style=for-the-badge&logo=spring" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Java-17-red?style=for-the-badge&logo=java" />
</div>

<br>

> **AI-Powered Code Review & Automated Patch Application System**
> 
> Automatically analyze pull requests, detect issues, and apply fixes with AI-generated patches.

---

## 🎯 Overview

Patch Pilot is an intelligent code review system that integrates seamlessly with GitHub to provide automated code analysis and patch suggestions. Using advanced pattern recognition and AI capabilities, it helps development teams maintain code quality and consistency.

### ✨ Key Features

- **🔍 Automated Code Analysis**: Instantly analyze pull requests when created
- **🤖 AI-Powered Suggestions**: Generate intelligent patch suggestions for detected issues  
- **⚡ One-Click Fixes**: Apply patches directly from the dashboard
- **📊 Real-time Monitoring**: Track repository health and review metrics
- **🔒 Secure Integration**: HMAC-verified GitHub webhooks
- **🎨 Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

### Backend Stack
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL (production) / H2 (development)
- **Security**: JWT authentication with Spring Security
- **API Documentation**: Swagger/OpenAPI 3.0

### Frontend Stack  
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher  
- Docker Desktop (optional)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AM4517UMOR4NG/Patch-Pilot.git
cd Patch-Pilot
```

2. **Start the backend**
```bash
cd backend
java -jar target/ai-code-review-backend-1.0.0.jar --spring.profiles.active=h2
```

3. **Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html

### Using Docker (Alternative)

```bash
# Build and run all services
docker-compose up --build

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

#### Backend
```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/patchpilot
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password

# Security
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION_SECONDS=86400
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# CORS
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
```

#### Frontend
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📚 Usage Guide

### 1. Login
- Navigate to http://localhost:5173
- Use default credentials: `admin` / `password`

### 2. Register a Repository
- Click "Add Repository" on the dashboard
- Enter repository name (e.g., `owner/repo-name`)
- Provide the clone URL
- Save the generated webhook secret

### 3. Configure GitHub Webhook
- Go to your GitHub repository settings
- Navigate to Webhooks → Add webhook
- Set Payload URL: `http://your-domain/webhooks/github`
- Content type: `application/json`
- Secret: Use the webhook secret from step 2
- Events: Select "Pull requests"

### 4. Automatic Analysis
- When a PR is created/updated, Patch Pilot automatically analyzes the code
- View findings and suggested patches in the dashboard
- Apply patches with one click

## 🔌 API Documentation

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### Repository Management
```http
GET /api/repos              # List all repositories
POST /api/repos             # Register new repository
GET /api/repos/{id}         # Get repository details
DELETE /api/repos/{id}      # Remove repository
```

### Pull Request & Analysis
```http
GET /api/pullrequests/{id}         # Get PR details
GET /api/pullrequests/{id}/runs    # List analysis runs
GET /api/runs/{id}                 # Get run details
GET /api/runs/{id}/findings        # Get findings
POST /api/patches/{id}/apply       # Apply patch
```

### Webhook Integration
```http
POST /webhooks/github
X-Hub-Signature-256: sha256=...
```

Full API documentation: http://localhost:8080/swagger-ui/index.html

## 🛡️ Security

### Best Practices

1. **Webhook Verification**
   - All GitHub webhooks are verified using HMAC SHA-256
   - Signature validation prevents unauthorized webhook calls

2. **Authentication & Authorization**
   - JWT-based authentication with configurable expiration
   - Role-based access control (RBAC)
   - Secure password hashing with BCrypt

3. **Environment Security**
   - Never commit secrets to version control
   - Use environment variables for sensitive configuration
   - Rotate secrets regularly

4. **Code Execution** (⚠️ Important)
   - Code analysis must run in isolated containers
   - Apply resource limits and network isolation
   - Never execute untrusted code on the host system

## 📁 Project Structure

```
Patch-Pilot/
├── backend/                  # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java source code
│   │   │   └── resources/  # Configuration files
│   │   └── test/           # Test files
│   ├── target/             # Compiled JAR
│   └── pom.xml             # Maven configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # API client
│   │   └── utils/         # Utility functions
│   ├── dist/              # Production build
│   └── package.json       # Node dependencies
├── docs/                  # Documentation
│   └── examples/         # Sample payloads
├── docker-compose.yml    # Docker configuration
└── README.md            # This file
```

## 🧪 Testing

### Unit Tests
```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm test
```

### Integration Tests
```bash
# Backend integration tests
mvn verify

# Frontend E2E tests
npx playwright test
```

### Test Coverage
```bash
# Generate coverage report
mvn jacoco:report
npm run coverage
```

## 🚢 Deployment

### Production Checklist

- [ ] Change default credentials
- [ ] Configure PostgreSQL database
- [ ] Set strong JWT secret
- [ ] Configure HTTPS/SSL
- [ ] Set up reverse proxy (nginx)
- [ ] Implement rate limiting
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up log aggregation (ELK stack)
- [ ] Configure backup strategy
- [ ] Implement CI/CD pipeline

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📧 Contact

**Developer**: aekmohop@gmail.com

**Project Link**: [https://github.com/AM4517UMOR4NG/Patch-Pilot](https://github.com/AM4517UMOR4NG/Patch-Pilot)

## 📄 License

This project is licensed under the Apache 2.o License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spring Boot community
- React community
- All contributors and testers

---
