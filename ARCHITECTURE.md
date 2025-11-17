# 🏗️ Patch Pilot - System Architecture

Complete technical overview of the Patch Pilot platform.

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                     http://localhost:3000                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    REACT FRONTEND                           │
│  ┌─────────────┬──────────────┬──────────────┬──────────┐  │
│  │  Analysis   │  Dashboard   │ AI Insights  │   Home   │  │
│  │    Page     │     Page     │     Page     │   Page   │  │
│  └─────────────┴──────────────┴──────────────┴──────────┘  │
│                                                             │
│  - TypeScript + React 18                                   │
│  - Framer Motion (Animations)                              │
│  - Lucide Icons                                            │
│  - TailwindCSS                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│               SPRING BOOT BACKEND                           │
│                 (Port 8080)                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Controllers                          │  │
│  │  - AdvancedAnalysisController                        │  │
│  │  - RunController                                     │  │
│  │  - DashboardController                               │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │              Business Services                        │  │
│  │  - AdvancedAnalysisService (30+ patterns)           │  │
│  │  - GitCloneService (Repository cloning)             │  │
│  │  - AIService (OpenAI integration)                   │  │
│  │  - GitHubApiService (GitHub API)                    │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │              Data Repositories                        │  │
│  │  - RunRepository                                     │  │
│  │  - FindingRepository                                 │  │
│  │  - RepoRepository                                    │  │
│  │  - PullRequestRepository                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ JPA/Hibernate
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   POSTGRESQL DATABASE                       │
│                     (Port 5432)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                             │  │
│  │  - repos (repositories)                              │  │
│  │  - pull_requests (PRs/branches)                      │  │
│  │  - runs (analysis executions)                        │  │
│  │  - findings (code issues)                            │  │
│  │  - suggested_patches (AI fixes)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  - GitHub API (repository access)                           │
│  - OpenAI API (AI suggestions - optional)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Details

### Frontend (React + TypeScript)

**Location**: `frontend/`

**Tech Stack**:
- React 18
- TypeScript 5.0
- Vite (Build tool)
- TailwindCSS (Styling)
- Framer Motion (Animations)
- Lucide React (Icons)

**Key Pages**:
1. **Home** (`/`) - Landing page with overview
2. **Analysis** (`/analysis`) - Repository analysis interface
3. **Dashboard** (`/dashboard`) - Analysis history and results
4. **AI Insights** (`/insights`) - Code health metrics and recommendations

**Key Features**:
- Real-time progress tracking
- Interactive visualizations
- Local storage for recent analyses
- Responsive design
- Error handling with user feedback

---

### Backend (Spring Boot + Java)

**Location**: `backend/`

**Tech Stack**:
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- Hibernate
- Maven
- PostgreSQL Driver
- Git (for cloning)

**Architecture Layers**:

#### 1. Controllers (`controller/`)
Handle HTTP requests and responses.

- **AdvancedAnalysisController**: Main analysis endpoint
  - `POST /api/analysis/analyze` - Start analysis
  - `GET /api/analysis/progress/{runId}` - Check progress
  - `GET /api/analysis/findings/{runId}` - Get results

#### 2. Services (`service/`)
Business logic and processing.

- **AdvancedAnalysisService**: Core analysis engine
  - 30+ security patterns
  - Performance analysis
  - Code quality checks
  - Complexity analysis
  - Architecture patterns

- **GitCloneService**: Repository management
  - Clone repositories
  - Manage workspace
  - Handle branches/PRs

- **AIService**: AI integration
  - OpenAI API calls
  - Generate suggestions
  - Context analysis

- **GitHubApiService**: GitHub integration
  - Fetch repository data
  - PR information

#### 3. Repositories (`repository/`)
Data access layer (JPA).

- RepoRepository
- PullRequestRepository
- RunRepository
- FindingRepository
- SuggestedPatchRepository

#### 4. Entities (`entity/`)
Domain models mapped to database tables.

- Repo
- PullRequest
- Run
- Finding
- SuggestedPatch

---

### Database (PostgreSQL)

**Schema**:

```sql
┌─────────────┐
│    repos    │
├─────────────┤
│ id          │ PK
│ name        │
│ clone_url   │
│ created_at  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│  pull_requests      │
├─────────────────────┤
│ id                  │ PK
│ repo_id             │ FK
│ pr_number           │
│ title               │
│ author              │
│ source_branch       │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│       runs          │
├─────────────────────┤
│ id                  │ PK
│ pull_request_id     │ FK
│ status              │ ENUM
│ started_at          │
│ completed_at        │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│     findings        │
├─────────────────────┤
│ id                  │ PK
│ run_id              │ FK
│ file_path           │
│ line_number         │
│ title               │
│ description         │
│ category            │
│ severity            │
│ code_snippet        │
│ is_resolved         │
└──────┬──────────────┘
       │
       │ 1:1
       │
┌──────▼──────────────┐
│ suggested_patches   │
├─────────────────────┤
│ id                  │ PK
│ finding_id          │ FK
│ explanation         │
│ unified_diff        │
│ is_applied          │
└─────────────────────┘
```

---

## 🔄 Analysis Flow

### 1. User Initiates Analysis

```
User enters GitHub URL
    ↓
Frontend validates URL
    ↓
POST /api/analysis/analyze
    ↓
Backend receives request
```

### 2. Repository Processing

```
Parse GitHub URL
    ↓
Create Repo & PullRequest records
    ↓
Create Run record (IN_PROGRESS)
    ↓
Clone repository to /tmp/workspace
    ↓
Verify files exist
```

### 3. Code Analysis

```
Scan all files in repository
    ↓
For each file:
    ├─ Check file extension
    ├─ Read file content
    └─ Run pattern detection
        ├─ Security patterns (30+)
        ├─ Performance patterns
        ├─ Code quality patterns
        ├─ Vulnerability patterns
        ├─ Architecture patterns
        └─ AI insight patterns
    ↓
Create Finding records
    ↓
Calculate metrics
```

### 4. AI Enhancement (Optional)

```
For high-severity findings:
    ↓
Call OpenAI API
    ↓
Generate suggested fixes
    ↓
Create SuggestedPatch records
```

### 5. Results

```
Update Run status (COMPLETED)
    ↓
Calculate scores:
    ├─ Security Score
    ├─ Performance Score
    ├─ Quality Score
    └─ Overall Score
    ↓
Return results to frontend
    ↓
Display in UI
```

---

## 🔍 Pattern Detection Engine

### Security Patterns (30+)

```
Hardcoded Secrets:
  password = "secret123"
  api_key = "abc123"
  
SQL Injection:
  query = "SELECT * FROM users WHERE id = " + userId
  
XSS Vulnerability:
  element.innerHTML = userInput
  
Command Injection:
  Runtime.exec(userCommand)
  
Weak Cryptography:
  MD5, SHA1, DES, RC4
  
Path Traversal:
  "../../../etc/passwd"
```

### Performance Patterns

```
N+1 Query:
  for (user in users) {
    user.getOrders() // Database call in loop
  }
  
Memory Leak:
  addEventListener without removeEventListener
  setInterval without clearInterval
  
Synchronous I/O:
  readFileSync(), writeFileSync()
  
Blocking Operations:
  Thread.sleep(), time.sleep()
```

### Code Quality Patterns

```
Long Method:
  Methods > 1000 characters
  
God Class:
  Classes with too many methods
  
Deep Nesting:
  > 5 levels of nesting
  
Magic Numbers:
  hardcoded numeric values
  
Duplicate Code:
  Repeated code blocks
```

### Architecture Patterns

```
Tight Coupling:
  Multiple "new" instantiations
  
Circular Dependencies:
  A imports B, B imports A
  
Missing Dependency Injection:
  Class creates its own dependencies
```

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```
docker-compose.yml
├── Frontend (Nginx)
├── Backend (Spring Boot)
└── Database (PostgreSQL)

All services in one network
Auto-configured
Easy to scale
```

### Option 2: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: patch-pilot-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: patch-pilot-backend:latest
        ports:
        - containerPort: 8080
```

### Option 3: Manual Deployment

```
1. PostgreSQL server (standalone)
2. Java JAR file (backend)
3. Nginx (frontend static files)
4. Reverse proxy (optional)
```

---

## 🔒 Security Considerations

### 1. Authentication (Future)
- JWT tokens
- OAuth2 integration
- GitHub authentication

### 2. Authorization
- Role-based access control
- Repository access validation

### 3. Data Protection
- Encrypted credentials
- Secure API keys
- HTTPS in production

### 4. Rate Limiting
- API throttling
- GitHub API rate limits
- Database connection pooling

---

## 📊 Performance Optimization

### Backend
- Connection pooling (HikariCP)
- JPA query optimization
- Caching (future)
- Async processing

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Service workers (future)

### Database
- Indexes on frequently queried columns
- Query optimization
- Connection pooling
- Partitioning (for large datasets)

---

## 🔧 Configuration Files

### Backend Configuration
```
application.yml
├── dev (H2 in-memory)
├── local (PostgreSQL local)
└── prod (PostgreSQL production)
```

### Frontend Configuration
```
vite.config.ts
├── Build settings
├── Proxy configuration
└── Plugin configuration
```

### Docker Configuration
```
docker-compose.yml
├── Service definitions
├── Network configuration
├── Volume mounts
└── Environment variables
```

---

## 📈 Scalability

### Horizontal Scaling
- Multiple backend instances
- Load balancer (Nginx/HAProxy)
- Database replication

### Vertical Scaling
- Increase container resources
- Optimize JVM settings
- Database tuning

### Caching Strategy
- Redis for session storage
- Query result caching
- Static asset CDN

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer tests
- Controller tests
- Repository tests

### Integration Tests
- API endpoint tests
- Database integration
- GitHub API mocking

### E2E Tests
- Full analysis flow
- UI interaction tests
- Performance tests

---

## 📚 Technology Decisions

### Why Spring Boot?
- Enterprise-grade
- Rich ecosystem
- Easy database integration
- Auto-configuration

### Why React?
- Component-based
- Large community
- Rich ecosystem
- TypeScript support

### Why PostgreSQL?
- Robust and reliable
- JSON support
- Full-text search
- ACID compliant

### Why Docker?
- Easy deployment
- Environment consistency
- Scalability
- Isolation

---

## 🔮 Future Enhancements

1. **Real-time Analysis**
   - WebSocket integration
   - Live progress updates

2. **AI Improvements**
   - Custom ML models
   - Better context understanding
   - Auto-fix generation

3. **GitHub Integration**
   - Automated PR comments
   - GitHub Actions integration
   - Status checks

4. **Multi-language Support**
   - Python analysis
   - JavaScript/TypeScript analysis
   - Go analysis
   - More languages

5. **Collaboration Features**
   - Team workspaces
   - Shared analyses
   - Comments and discussions

---

This architecture provides a solid foundation for scalable, maintainable, and performant code analysis! 🚀
