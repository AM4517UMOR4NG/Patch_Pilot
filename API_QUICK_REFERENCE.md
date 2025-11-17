# API Quick Reference - Patch Pilot

## Base URLs

- **Frontend**: http://localhost:3000
- **Backend (Direct)**: http://localhost:8080
- **API (via Nginx)**: http://localhost:3000/api

---

## Authentication

Semua endpoints PUBLIC (no authentication required)

---

## API Endpoints

### 1. Health Check

```http
GET /api/actuator/health
```

**Response:**
```json
{
  "status": "UP"
}
```

**cURL:**
```bash
curl http://localhost:3000/api/actuator/health
```

---

### 2. Sync Pull Request (Main Feature)

```http
POST /api/github/sync/{owner}/{repo}/pr/{prNumber}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/github/sync/facebook/react/pr/27000
```

**Success Response (200):**
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

**Error Response (404):**
```json
{
  "success": false,
  "error": "Pull request not found or could not be fetched",
  "repository": "owner/repo",
  "prNumber": 123
}
```

---

### 3. Get All Repositories

```http
GET /api/repos
```

**Example:**
```bash
curl http://localhost:3000/api/repos
```

**Response:**
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

---

### 4. Get Pull Requests by Repository

```http
GET /api/pullrequests/repo/{repoId}
```

**Example:**
```bash
curl http://localhost:3000/api/pullrequests/repo/1
```

**Response:**
```json
[
  {
    "id": 1,
    "repoId": 1,
    "prNumber": 27000,
    "title": "Bump semver from 5.7.1 to 7.5.2",
    "description": "Bumps semver to 7.5.2...",
    "author": "dependabot[bot]",
    "sourceBranch": "feature-branch",
    "targetBranch": "main",
    "status": "open",
    "createdAt": "2023-07-15T10:00:00",
    "updatedAt": "2023-07-15T10:00:00"
  }
]
```

---

### 5. Get Analysis Runs by Pull Request (Most Important!)

```http
GET /api/runs/pull-request/{pullRequestId}
```

**Example:**
```bash
curl http://localhost:3000/api/runs/pull-request/1
```

**Response:**
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

**Run Status Values:**
- `PENDING` - Queued, belum mulai
- `IN_PROGRESS` - Sedang analisis
- `COMPLETED` - Selesai
- `FAILED` - Error (cek errorMessage)

**Severity Levels:**
- `HIGH` - Critical (security, major bugs)
- `MEDIUM` - Important (performance, maintainability)
- `LOW` - Minor (style, suggestions)

**Category Types:**
- `SECURITY` - Security vulnerabilities
- `BUG` - Logic errors
- `CODE_SMELL` - Code quality
- `PERFORMANCE` - Performance issues
- `BEST_PRACTICE` - Recommendations

---

### 6. Get Specific Run by ID

```http
GET /api/runs/{id}
```

**Example:**
```bash
curl http://localhost:3000/api/runs/1
```

**Response:** Same as endpoint #5, single object

---

### 7. Get Specific Pull Request

```http
GET /api/pullrequests/{id}
```

**Example:**
```bash
curl http://localhost:3000/api/pullrequests/1
```

**Response:** Same as endpoint #4, single object

---

### 8. Sync Entire Repository (All Open PRs)

```http
POST /api/github/sync/{owner}/{repo}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/github/sync/facebook/react
```

**Response:**
```json
{
  "success": true,
  "repository": "facebook/react",
  "pullRequestsFound": 15,
  "message": "Successfully fetched and queued 15 pull requests for analysis"
}
```

---

### 9. Polling Control

**Start Polling:**
```http
POST /api/github/polling/start
```

```bash
curl -X POST http://localhost:3000/api/github/polling/start
```

**Stop Polling:**
```http
POST /api/github/polling/stop
```

```bash
curl -X POST http://localhost:3000/api/github/polling/stop
```

**Get Polling Status:**
```http
GET /api/github/polling/status
```

```bash
curl http://localhost:3000/api/github/polling/status
```

**Response:**
```json
{
  "isPolling": true,
  "pollingInterval": 30,
  "lastPollTime": "2025-11-16T09:00:00",
  "nextPollTime": "2025-11-16T09:30:00"
}
```

---

## Frontend TypeScript Usage

### Import API Functions

```typescript
import {
  healthCheck,
  syncPullRequest,
  getRepos,
  getPullRequestsByRepo,
  getRunsByPullRequest,
} from './api'
```

### Check Backend Health

```typescript
const isHealthy = await healthCheck()
console.log(isHealthy) // true or false
```

### Sync Pull Request

```typescript
const result = await syncPullRequest('facebook', 'react', 27000)
console.log(result)
// {
//   success: true,
//   repository: "facebook/react",
//   prNumber: 27000,
//   ...
// }
```

### Get Repositories

```typescript
const repos = await getRepos()
console.log(repos)
// [{ id: 1, name: "facebook/react", ... }]
```

### Get Pull Requests for Repo

```typescript
const prs = await getPullRequestsByRepo(1)
console.log(prs)
// [{ id: 1, prNumber: 27000, ... }]
```

### Get Analysis Results

```typescript
const runs = await getRunsByPullRequest(1)
const latestRun = runs[0]

console.log(latestRun.status) // "COMPLETED"
console.log(latestRun.findings) // Array of findings
console.log(latestRun.findings[0].suggestedPatches) // Recommendations
```

### Complete Flow Example

```typescript
async function analyzeGitHubPR(owner: string, repo: string, prNumber: number) {
  try {
    // 1. Sync PR
    console.log('Syncing PR...')
    await syncPullRequest(owner, repo, prNumber)
    
    // 2. Wait & poll for results
    console.log('Waiting for analysis...')
    const run = await pollForResults(owner, repo, prNumber)
    
    // 3. Display results
    if (run.status === 'COMPLETED') {
      console.log('Analysis completed!')
      console.log(`Found ${run.findings.length} issues`)
      
      run.findings.forEach(finding => {
        console.log(`- ${finding.severity}: ${finding.title}`)
        console.log(`  File: ${finding.filePath}:${finding.lineNumber}`)
        
        finding.suggestedPatches?.forEach(patch => {
          console.log(`  Recommendation: ${patch.explanation}`)
        })
      })
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

async function pollForResults(owner, repo, prNumber) {
  const timeout = 90000 // 90 seconds
  const interval = 3000 // 3 seconds
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    // Get repos
    const repos = await getRepos()
    const repoMatch = repos.find(r => 
      r.name.toLowerCase() === `${owner}/${repo}`.toLowerCase()
    )
    
    if (repoMatch) {
      // Get PRs
      const prs = await getPullRequestsByRepo(repoMatch.id)
      const prMatch = prs.find(p => p.prNumber === prNumber)
      
      if (prMatch) {
        // Get runs
        const runs = await getRunsByPullRequest(prMatch.id)
        const latestRun = runs[0]
        
        // Check if done
        if (latestRun.status === 'COMPLETED' || latestRun.status === 'FAILED') {
          return latestRun
        }
      }
    }
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error('Analysis timeout')
}

// Usage
analyzeGitHubPR('facebook', 'react', 27000)
```

---

## Error Handling

### HTTP Status Codes

- **200 OK** - Success
- **400 Bad Request** - Invalid input
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Try-Catch Pattern

```typescript
try {
  const result = await syncPullRequest(owner, repo, prNumber)
  console.log('Success:', result)
} catch (error) {
  if (error.message.includes('404')) {
    console.error('PR not found or repository does not exist')
  } else if (error.message.includes('400')) {
    console.error('Invalid input parameters')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

---

## Common Use Cases

### 1. Analyze Single PR

```bash
curl -X POST http://localhost:3000/api/github/sync/facebook/react/pr/27000

# Wait a few seconds, then check results
curl http://localhost:3000/api/repos
curl http://localhost:3000/api/pullrequests/repo/1
curl http://localhost:3000/api/runs/pull-request/1
```

### 2. Analyze All Open PRs in Repo

```bash
curl -X POST http://localhost:3000/api/github/sync/facebook/react
```

### 3. Check Analysis Status

```bash
# Get run by ID
curl http://localhost:3000/api/runs/1

# Check status field: PENDING, IN_PROGRESS, COMPLETED, FAILED
```

### 4. Get All Findings

```bash
curl http://localhost:3000/api/runs/pull-request/1 | jq '.[]findings'
```

---

## Environment Setup

### For Private Repositories

Add to `docker-compose.yml`:

```yaml
backend:
  environment:
    GITHUB_TOKEN: ghp_your_token_here_1234567890
```

Or export in shell:

```bash
export GITHUB_TOKEN=ghp_your_token_here_1234567890
docker-compose up --build
```

### For AI-Powered Analysis

```yaml
backend:
  environment:
    OPENAI_API_KEY: sk-your_openai_key_here
```

---

## Testing the System

### 1. Test Backend Health

```bash
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

### 2. Test Through Nginx

```bash
curl http://localhost:3000/api/actuator/health
# Should return: {"status":"UP"}
```

### 3. Test with Real PR

```bash
# Public repository
curl -X POST http://localhost:3000/api/github/sync/facebook/react/pr/27000

# Should return success response with PR details
```

### 4. Check Database

```bash
docker exec -it patch_pilot-db-1 psql -U postgres -d aicodereview

# SQL queries
SELECT * FROM repos;
SELECT * FROM pull_requests;
SELECT * FROM runs;
SELECT * FROM findings;
```

---

## Rate Limits

**GitHub API Rate Limits:**
- Without token: 60 requests/hour
- With token: 5000 requests/hour

**Check Your Rate Limit:**
```bash
curl https://api.github.com/rate_limit
```

**Recommendation:** Always use GITHUB_TOKEN for production!

---

## Troubleshooting Quick Fixes

### Backend Returns 502

```bash
# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs backend --tail 50
```

### Repository Not Found

- Verify repository exists and is public
- For private repos, set GITHUB_TOKEN
- Check: `curl https://api.github.com/repos/{owner}/{repo}`

### Analysis Stuck

```bash
# Check run status
curl http://localhost:3000/api/runs/{id}

# Check backend logs
docker-compose logs backend | grep -i "analysis\|error"

# Restart if needed
docker-compose restart backend
```

---

## Additional Resources

- Full Documentation: `API_DOCUMENTATION.md`
- System Flow: `CARA_KERJA_SISTEM.md`
- Setup Guide: `SETUP_GUIDE.md`
- GitHub API Docs: https://docs.github.com/en/rest
