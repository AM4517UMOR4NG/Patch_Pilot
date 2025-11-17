# Patch Pilot API Documentation

## Ringkasan Sistem / System Overview

Patch Pilot adalah sistem analisis kode otomatis untuk GitHub Pull Requests. Sistem ini:
1. Mengambil Pull Request dari GitHub
2. Mengkloning repository dan melakukan analisis kode
3. Mendeteksi masalah (bugs, security issues, code smells)
4. Memberikan rekomendasi perbaikan

---

## Arsitektur Sistem / System Architecture

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ HTTP Requests
       │ (fetch API)
       ↓
┌──────────────┐
│    Nginx     │  Port 3000 (Frontend Container)
│  Proxy       │  - Serves static files
│              │  - Proxies /api/* → backend:8080
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────┐
│   Spring Boot Backend            │  Port 8080
│   (Java 17 + PostgreSQL)         │
│                                  │
│  ┌────────────────────────────┐ │
│  │  Controllers:              │ │
│  │  - GitHubSyncController    │ │
│  │  - RunController           │ │
│  │  - PullRequestController   │ │
│  └────────────────────────────┘ │
│           ↓                      │
│  ┌────────────────────────────┐ │
│  │  Services:                 │ │
│  │  - GitHubApiService        │ │
│  │  - RunnerService           │ │
│  │  - AnalysisService         │ │
│  └────────────────────────────┘ │
│           ↓                      │
│  ┌────────────────────────────┐ │
│  │  Repositories (JPA):       │ │
│  │  - RepoRepository          │ │
│  │  - PullRequestRepository   │ │
│  │  - RunRepository           │ │
│  │  - FindingRepository       │ │
│  └────────────────────────────┘ │
└──────────┬───────────────────────┘
           │
           ↓
    ┌──────────────┐
    │ PostgreSQL   │  Port 5432
    │   Database   │
    └──────────────┘
           ↑
           │ GitHub API
    ┌──────────────┐
    │   GitHub     │
    │  api.github  │
    │    .com      │
    └──────────────┘
```

---

## Data Flow / Alur Data

### 1. User Menginput URL PR / User Inputs PR URL

```
User → Frontend (App.tsx) → parseGitHubPrInput()
  ↓
Extracts: owner, repo, prNumber
```

### 2. Sync Pull Request

```
Frontend → POST /api/github/sync/{owner}/{repo}/pr/{prNumber}
  ↓
Backend (GitHubSyncController.syncPullRequestBySegments)
  ↓
GitHubApiService.fetchSinglePullRequest()
  ├─ GitHub API: GET /repos/{owner}/{repo}/pulls/{prNumber}
  ├─ Creates/Updates Repo entity in DB
  ├─ Creates PullRequest entity in DB
  └─ Triggers RunnerService.triggerRun()
      ├─ Creates Run entity (status: PENDING)
      ├─ Clones repository to workspace
      ├─ Calls AnalysisService.analyzeCode()
      │   ├─ Scans Java/JS/Python files
      │   ├─ Detects issues
      │   └─ Creates Finding entities
      └─ Updates Run status (COMPLETED/FAILED)
```

### 3. Frontend Polling untuk Status

```
Frontend → Loops every 3 seconds:
  ├─ getRepos() → GET /api/repos
  ├─ getPullRequestsByRepo(repoId) → GET /api/pullrequests/repo/{repoId}
  └─ getRunsByPullRequest(pullRequestId) → GET /api/runs/pull-request/{pullRequestId}
      ↓
  Checks run.status === 'COMPLETED' or 'FAILED'
      ↓
  Displays findings and suggested patches
```

---

## API Endpoints - Detail Lengkap

### Base URL

- **Frontend**: `http://localhost:3000`
- **Backend (Direct)**: `http://localhost:8080`
- **API Base (via nginx)**: `http://localhost:3000/api`

---

## 1. HEALTH CHECK

### GET /api/actuator/health

**Deskripsi**: Memeriksa status kesehatan backend  
**Authentication**: None (Public)

**Response**:
```json
{
  "status": "UP"
}
```

**Contoh Frontend Call**:
```typescript
const response = await fetch('/api/actuator/health')
const data = await response.json()
console.log(data.status) // "UP"
```

---

## 2. GITHUB SYNC - FETCH PULL REQUEST

### POST /api/github/sync/{owner}/{repo}/pr/{prNumber}

**Deskripsi**: Mengambil Pull Request dari GitHub dan memulai analisis

**Path Parameters**:
- `owner` (string, required): GitHub username/organization
- `repo` (string, required): Repository name
- `prNumber` (integer, required): Pull Request number

**Authentication**: None (Public, tapi rate-limited tanpa token)

**Request Example**:
```http
POST /api/github/sync/facebook/react/pr/27000
Content-Type: application/json
```

**Success Response (200)**:
```json
{
  "success": true,
  "repository": "facebook/react",
  "prNumber": 27000,
  "prTitle": "Bump semver from 5.7.1 to 7.5.2",
  "prAuthor": "dependabot[bot]",
  "message": "Pull request fetched and queued for analysis"
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "error": "GitHub API error message",
  "repository": "facebook/react",
  "prNumber": 27000
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "error": "Pull request not found or could not be fetched",
  "repository": "owner/repo",
  "prNumber": 123
}
```

**Backend Logic Flow**:
```java
1. GitHubSyncController.syncPullRequestBySegments()
   ├─ Validates owner, repo, prNumber
   └─ Calls GitHubApiService.fetchSinglePullRequest()

2. GitHubApiService.fetchSinglePullRequest()
   ├─ Normalizes repo name using RepoNameUtils
   ├─ Finds or creates Repo entity
   ├─ GitHub API call: GET https://api.github.com/repos/{owner}/{repo}/pulls/{prNumber}
   ├─ Creates/Updates PullRequest entity
   └─ Calls createAndTriggerRun()

3. createAndTriggerRun()
   ├─ Creates Run entity with status PENDING
   └─ Calls runnerService.triggerRun(run)

4. RunnerService.triggerRun()
   ├─ Updates Run status to IN_PROGRESS
   ├─ Clones repository to workspace directory
   ├─ Checks out commit SHA
   ├─ Calls analysisService.analyzeCode()
   └─ Updates Run status to COMPLETED or FAILED
```

---

## 3. REPOSITORY MANAGEMENT

### GET /api/repos

**Deskripsi**: Mendapatkan daftar semua repository yang terdaftar

**Authentication**: None

**Response (200)**:
```json
[
  {
    "id": 1,
    "name": "facebook/react",
    "cloneUrl": "https://github.com/facebook/react.git",
    "defaultBranch": "main",
    "webhookSecret": null,
    "createdAt": "2025-11-16T09:00:00",
    "updatedAt": "2025-11-16T09:30:00"
  }
]
```

**Contoh Frontend**:
```typescript
const repos = await getRepos()
console.log(repos[0].name) // "facebook/react"
```

---

## 4. PULL REQUEST QUERIES

### GET /api/pullrequests/repo/{repoId}

**Deskripsi**: Mendapatkan semua Pull Requests untuk repository tertentu

**Path Parameters**:
- `repoId` (integer, required): Repository ID dari database

**Response (200)**:
```json
[
  {
    "id": 1,
    "repoId": 1,
    "prNumber": 27000,
    "title": "Bump semver from 5.7.1 to 7.5.2",
    "description": "Bumps semver to 7.5.2...",
    "author": "dependabot[bot]",
    "sourceBranch": "dependabot/npm_and_yarn/fixtures/dom/semver-7.5.2",
    "targetBranch": "main",
    "status": "open",
    "createdAt": "2023-07-15T10:00:00",
    "updatedAt": "2023-07-15T10:00:00"
  }
]
```

### GET /api/pullrequests/{id}

**Deskripsi**: Mendapatkan detail Pull Request spesifik

**Path Parameters**:
- `id` (integer, required): Pull Request ID

**Response (200)**: Same structure as above, single object

---

## 5. RUN QUERIES - ANALYSIS RESULTS

### GET /api/runs/pull-request/{pullRequestId}

**Deskripsi**: Mendapatkan semua analysis runs untuk Pull Request tertentu

**Path Parameters**:
- `pullRequestId` (integer, required): Pull Request ID

**Response (200)**:
```json
[
  {
    "id": 1,
    "pullRequestId": 1,
    "status": "COMPLETED",
    "commitSha": "abc123def456",
    "triggeredBy": "manual",
    "startedAt": "2025-11-16T09:00:00",
    "completedAt": "2025-11-16T09:02:30",
    "errorMessage": null,
    "findings": [
      {
        "id": 1,
        "runId": 1,
        "filePath": "src/components/Button.tsx",
        "lineNumber": 45,
        "endLineNumber": 48,
        "severity": "HIGH",
        "category": "SECURITY",
        "title": "Potential XSS vulnerability",
        "description": "Unsanitized user input being rendered",
        "codeSnippet": "const Button = () => {\n  return <div>{userInput}</div>\n}",
        "isResolved": false,
        "createdAt": "2025-11-16T09:02:00",
        "suggestedPatches": [
          {
            "id": 1,
            "findingId": 1,
            "unifiedDiff": "@@ -45,1 +45,1 @@\n-  return <div>{userInput}</div>\n+  return <div>{sanitize(userInput)}</div>",
            "explanation": "Sanitize user input before rendering to prevent XSS attacks",
            "applied": false,
            "appliedAt": null,
            "appliedBy": null,
            "createdAt": "2025-11-16T09:02:00"
          }
        ]
      }
    ]
  }
]
```

**Run Status Values**:
- `PENDING`: Analisis sedang di-queue
- `IN_PROGRESS`: Sedang menganalisis kode
- `COMPLETED`: Analisis selesai
- `FAILED`: Analisis gagal (lihat errorMessage)

**Finding Severity Values**:
- `HIGH`: Masalah kritis (security, critical bugs)
- `MEDIUM`: Masalah penting (performance, maintainability)
- `LOW`: Minor issues (code style, suggestions)

**Finding Category Values**:
- `SECURITY`: Keamanan (XSS, SQL Injection, etc.)
- `BUG`: Bug atau error logic
- `CODE_SMELL`: Code quality issues
- `PERFORMANCE`: Masalah performa
- `BEST_PRACTICE`: Rekomendasi best practices

### GET /api/runs/{id}

**Deskripsi**: Mendapatkan detail run spesifik

**Path Parameters**:
- `id` (integer, required): Run ID

**Response (200)**: Same structure as above, single object

---

## 6. SYNC ENTIRE REPOSITORY

### POST /api/github/sync/{owner}/{repo}

**Deskripsi**: Mengambil SEMUA open Pull Requests dari repository

**Path Parameters**:
- `owner` (string, required): GitHub username/organization
- `repo` (string, required): Repository name

**Response (200)**:
```json
{
  "success": true,
  "repository": "facebook/react",
  "pullRequestsFound": 15,
  "message": "Successfully fetched and queued 15 pull requests for analysis"
}
```

---

## 7. POLLING CONTROL

### POST /api/github/polling/start

**Deskripsi**: Memulai automatic polling (fetch PRs secara berkala)

**Response (200)**:
```json
{
  "success": true,
  "message": "Polling started successfully",
  "interval": 30
}
```

### POST /api/github/polling/stop

**Deskripsi**: Menghentikan automatic polling

**Response (200)**:
```json
{
  "success": true,
  "message": "Polling stopped successfully"
}
```

### GET /api/github/polling/status

**Deskripsi**: Cek status polling

**Response (200)**:
```json
{
  "isPolling": true,
  "pollingInterval": 30,
  "lastPollTime": "2025-11-16T09:00:00",
  "nextPollTime": "2025-11-16T09:30:00"
}
```

---

## Database Schema

### Table: repos
```sql
CREATE TABLE repos (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  clone_url VARCHAR(500),
  default_branch VARCHAR(100),
  webhook_secret VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Table: pull_requests
```sql
CREATE TABLE pull_requests (
  id BIGSERIAL PRIMARY KEY,
  repo_id BIGINT NOT NULL REFERENCES repos(id),
  pr_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  author VARCHAR(255),
  source_branch VARCHAR(255),
  target_branch VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  merged_at TIMESTAMP,
  closed_at TIMESTAMP,
  UNIQUE(repo_id, pr_number)
);
```

### Table: runs
```sql
CREATE TABLE runs (
  id BIGSERIAL PRIMARY KEY,
  pull_request_id BIGINT NOT NULL REFERENCES pull_requests(id),
  status VARCHAR(50) NOT NULL,
  commit_sha VARCHAR(100),
  triggered_by VARCHAR(100),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP
);
```

### Table: findings
```sql
CREATE TABLE findings (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES runs(id),
  file_path VARCHAR(1000) NOT NULL,
  line_number INTEGER,
  end_line_number INTEGER,
  severity VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  code_snippet TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### Table: suggested_patches
```sql
CREATE TABLE suggested_patches (
  id BIGSERIAL PRIMARY KEY,
  finding_id BIGINT NOT NULL REFERENCES findings(id),
  unified_diff TEXT,
  explanation TEXT,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP,
  applied_by VARCHAR(255),
  created_at TIMESTAMP
);
```

---

## Frontend API Integration

### File: frontend/src/api.ts

**Key Functions**:

```typescript
// Health check
export async function healthCheck(): Promise<boolean>

// Sync PR and trigger analysis
export async function syncPullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PrSyncResponse>

// Get all repositories
export async function getRepos(): Promise<RepoDto[]>

// Get PRs for a specific repo
export async function getPullRequestsByRepo(
  repoId: number
): Promise<PullRequestDto[]>

// Get analysis runs for a PR
export async function getRunsByPullRequest(
  pullRequestId: number
): Promise<RunDto[]>
```

**TypeScript Interfaces**:

```typescript
interface RunDto {
  id: number
  pullRequestId: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  commitSha?: string
  triggeredBy?: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  findings?: FindingDto[]
}

interface FindingDto {
  id: number
  runId: number
  filePath: string
  lineNumber?: number
  endLineNumber?: number
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  title: string
  description?: string
  codeSnippet?: string
  isResolved?: boolean
  suggestedPatches?: SuggestedPatchDto[]
}

interface SuggestedPatchDto {
  id: number
  findingId: number
  unifiedDiff?: string
  explanation?: string
  applied?: boolean
}
```

---

## Environment Variables

### Backend (docker-compose.yml)

```yaml
backend:
  environment:
    # Database
    DATABASE_URL: jdbc:postgresql://db:5432/aicodereview
    DATABASE_USER: postgres
    DATABASE_PASSWORD: postgres
    
    # GitHub API (Optional, but recommended)
    GITHUB_TOKEN: your_github_personal_access_token
    
    # OpenAI for AI-powered analysis (Optional)
    OPENAI_API_KEY: your_openai_api_key
    
    # Spring Profile
    SPRING_PROFILES_ACTIVE: local
    
    # CORS
    APP_CORS_ALLOWED_ORIGINS: http://localhost:3000
    
    # Workspace for cloning repos
    WORKSPACE_DIR: /tmp/patch-pilot-workspace
    
    # Polling configuration
    POLLING_ENABLED: false
    POLLING_INTERVAL_MINUTES: 30
```

### Frontend (docker-compose.yml)

```yaml
frontend:
  environment:
    VITE_API_BASE_URL: /api
```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Request berhasil
- **400 Bad Request**: Invalid input (e.g., malformed URL)
- **404 Not Found**: Resource tidak ditemukan (PR, repo, etc.)
- **500 Internal Server Error**: Server error (cek logs)

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "repository": "owner/repo",
  "prNumber": 123
}
```

---

## Rate Limiting

GitHub API memiliki rate limits:
- **Unauthenticated**: 60 requests/hour
- **Authenticated (with token)**: 5000 requests/hour

Untuk production, **WAJIB** menggunakan `GITHUB_TOKEN`.

---

## Security Considerations

1. **CORS**: Dikonfigurasi di backend untuk accept requests dari frontend origin
2. **Spring Security**: Semua `/api/**` endpoints di-allow tanpa authentication (public)
3. **GitHub Token**: Jangan commit token ke Git, gunakan environment variables
4. **Database**: PostgreSQL dengan credentials di environment variables
5. **Input Validation**: Backend memvalidasi owner/repo format sebelum GitHub API call

---

## Troubleshooting

### Backend Health DOWN
```bash
# Check backend logs
docker-compose logs backend --tail 50

# Check database connection
docker exec patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT 1;"
```

### 404 on API calls
```bash
# Verify nginx proxy config
docker exec patch_pilot-frontend-1 cat /etc/nginx/nginx.conf

# Test direct backend
curl http://localhost:8080/api/actuator/health
```

### GitHub API 404
```bash
# Verify repository exists and is public
curl https://api.github.com/repos/owner/repo

# Check if PR exists
curl https://api.github.com/repos/owner/repo/pulls/123
```

### Analysis stuck in PENDING
```bash
# Check runner service logs
docker-compose logs backend | grep -i "runner\|analysis"

# Check workspace directory permissions
docker exec patch_pilot-backend-1 ls -la /tmp/patch-pilot-workspace
```

---

## Testing Commands

### Test Backend Directly
```bash
# Health check
curl http://localhost:8080/actuator/health

# Sync a public PR
curl -X POST http://localhost:8080/api/github/sync/facebook/react/pr/27000

# Get repos
curl http://localhost:8080/api/repos

# Get runs for PR ID 1
curl http://localhost:8080/api/runs/pull-request/1
```

### Test Through Frontend Proxy
```bash
# Health check via nginx
curl http://localhost:3000/api/actuator/health

# Sync PR via nginx
curl -X POST http://localhost:3000/api/github/sync/facebook/react/pr/27000
```

---

## Complete Request/Response Example

### Scenario: Analyzing facebook/react PR #27000

**1. User pastes URL in frontend**
```
Input: https://github.com/facebook/react/pull/27000
```

**2. Frontend parses URL**
```typescript
parsed = {
  owner: "facebook",
  repo: "react",
  prNumber: 27000
}
```

**3. Frontend calls sync API**
```typescript
POST /api/github/sync/facebook/react/pr/27000
```

**4. Backend Response**
```json
{
  "success": true,
  "repository": "facebook/react",
  "prNumber": 27000,
  "prTitle": "Bump semver from 5.7.1 to 7.5.2",
  "prAuthor": "dependabot[bot]",
  "message": "Pull request fetched and queued for analysis"
}
```

**5. Frontend starts polling (every 3 seconds)**
```typescript
// Get repos
GET /api/repos
→ [{id: 1, name: "facebook/react", ...}]

// Get PRs for repo
GET /api/pullrequests/repo/1
→ [{id: 1, repoId: 1, prNumber: 27000, ...}]

// Get runs for PR
GET /api/runs/pull-request/1
→ [{id: 1, status: "IN_PROGRESS", findings: null}]

// Poll again after 3 seconds
GET /api/runs/pull-request/1
→ [{id: 1, status: "COMPLETED", findings: [...]}]
```

**6. Frontend displays results**
```
Status: COMPLETED
Files: [
  "fixtures/dom/package.json",
  "fixtures/dom/yarn.lock"
]
Findings: 2 issues found
- [MEDIUM] Outdated dependency: semver 5.7.1
- [LOW] Consider updating other dependencies
```

---

## Kesimpulan

Sistem ini menggunakan arsitektur **REST API** dengan:
- **Frontend**: React + TypeScript (polling untuk real-time updates)
- **Backend**: Spring Boot + Java 17 (business logic & GitHub integration)
- **Database**: PostgreSQL (persistent storage)
- **Proxy**: Nginx (reverse proxy untuk production deployment)

Data flow: **User Input → Frontend → API → Backend → GitHub API → Analysis → Database → API Response → Frontend Display**
