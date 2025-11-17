# Cara Kerja Sistem Patch Pilot - Penjelasan Detail

## Ringkasan Cepat

Patch Pilot adalah sistem untuk menganalisis Pull Request (PR) GitHub secara otomatis. Sistem ini:

1. Menerima URL GitHub PR dari user
2. Mengambil data PR dari GitHub
3. Mengkloning repository
4. Menganalisis kode untuk mencari bugs, security issues, dll
5. Menampilkan hasil analisis dengan rekomendasi perbaikan

---

## Alur Kerja Step-by-Step

### STEP 1: User Input URL PR

```
User ketik: https://github.com/facebook/react/pull/27000

Frontend parse URL:
- owner: "facebook"
- repo: "react"  
- prNumber: 27000
```

### STEP 2: Frontend Kirim Request

```typescript
// Frontend (api.ts)
fetch('/api/github/sync/facebook/react/pr/27000', {
  method: 'POST'
})
```

### STEP 3: Nginx Forward ke Backend

```
Browser → Nginx (port 3000) → Backend (port 8080)

URL: /api/github/sync/facebook/react/pr/27000
```

### STEP 4: Backend Ambil Data dari GitHub

```java
// Backend (GitHubSyncController.java)
@PostMapping("/sync/{owner}/{repo}/pr/{prNumber}")
public ResponseEntity<?> syncPullRequestBySegments(...) {
    // Panggil GitHub API
    PullRequest pr = gitHubApiService.fetchSinglePullRequest(repoName, prNumber);
    
    // Return success
    return ResponseEntity.ok(response);
}
```

GitHub API dipanggil:
```
GET https://api.github.com/repos/facebook/react/pulls/27000
```

Response:
```json
{
  "number": 27000,
  "title": "Bump semver from 5.7.1 to 7.5.2",
  "user": { "login": "dependabot[bot]" },
  "head": { "sha": "abc123...", "ref": "feature-branch" },
  "base": { "ref": "main" }
}
```

### STEP 5: Backend Simpan ke Database

```java
// Save Repo
Repo repo = new Repo();
repo.setName("facebook/react");
repo.setCloneUrl("https://github.com/facebook/react.git");
repoRepository.save(repo);

// Save Pull Request
PullRequest pr = new PullRequest();
pr.setRepo(repo);
pr.setPrNumber(27000);
pr.setTitle("Bump semver...");
pr.setAuthor("dependabot[bot]");
pullRequestRepository.save(pr);

// Create Run (untuk analisis)
Run run = new Run();
run.setPullRequest(pr);
run.setStatus(RunStatus.PENDING);
run.setCommitSha("abc123...");
runRepository.save(run);
```

Database sekarang berisi:
```
repos table:
  id=1, name="facebook/react", clone_url="https://..."

pull_requests table:
  id=1, repo_id=1, pr_number=27000, title="Bump semver..."

runs table:
  id=1, pull_request_id=1, status="PENDING", commit_sha="abc123..."
```

### STEP 6: Backend Trigger Analisis (Async)

```java
// RunnerService.triggerRun() - Berjalan di background
@Async
public void triggerRun(Run run) {
    // 1. Update status
    run.setStatus(RunStatus.IN_PROGRESS);
    runRepository.save(run);
    
    // 2. Clone repository
    Git git = Git.cloneRepository()
        .setURI("https://github.com/facebook/react.git")
        .setDirectory("/tmp/workspace/repo-1")
        .call();
    
    // 3. Checkout commit
    git.checkout().setName("abc123...").call();
    
    // 4. Analisis kode
    analysisService.analyzeCode(run, workspacePath);
    
    // 5. Update status selesai
    run.setStatus(RunStatus.COMPLETED);
    runRepository.save(run);
}
```

### STEP 7: Analisis Kode

```java
// AnalysisService.analyzeCode()
public void analyzeCode(Run run, Path workspacePath) {
    // 1. Ambil daftar file yang berubah
    List<String> changedFiles = getChangedFiles();
    
    // 2. Analisis tiap file
    for (String file : changedFiles) {
        List<String> lines = Files.readAllLines(file);
        
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            
            // Check hardcoded password
            if (line.contains("password") && line.contains("=")) {
                Finding finding = new Finding();
                finding.setFilePath(file);
                finding.setLineNumber(i + 1);
                finding.setSeverity(Severity.HIGH);
                finding.setCategory("SECURITY");
                finding.setTitle("Hardcoded credentials");
                finding.setDescription("Jangan hardcode password");
                findingRepository.save(finding);
                
                // Buat suggestion
                SuggestedPatch patch = new SuggestedPatch();
                patch.setFinding(finding);
                patch.setExplanation("Gunakan environment variable");
                suggestedPatchRepository.save(patch);
            }
            
            // Check SQL injection
            if (line.contains("SELECT") && line.contains("+")) {
                // Create finding...
            }
        }
    }
}
```

Database sekarang berisi findings:
```
findings table:
  id=1, run_id=1, file_path="src/utils/auth.js", line_number=45,
  severity="HIGH", category="SECURITY",
  title="Hardcoded credentials",
  description="Jangan hardcode password"

suggested_patches table:
  id=1, finding_id=1,
  explanation="Gunakan environment variable process.env.PASSWORD"
```

### STEP 8: Frontend Polling untuk Hasil

```typescript
// Frontend polling setiap 3 detik
while (Date.now() - start < 90000) {
  // 1. Ambil repos
  const repos = await getRepos();
  // GET /api/repos
  
  // 2. Cari repo yang match
  const repo = repos.find(r => r.name === "facebook/react");
  
  // 3. Ambil PRs untuk repo
  const prs = await getPullRequestsByRepo(repo.id);
  // GET /api/pullrequests/repo/1
  
  // 4. Cari PR yang match
  const pr = prs.find(p => p.prNumber === 27000);
  
  // 5. Ambil runs untuk PR
  const runs = await getRunsByPullRequest(pr.id);
  // GET /api/runs/pull-request/1
  
  // 6. Ambil run terbaru
  const latestRun = runs[0];
  
  // 7. Cek status
  if (latestRun.status === 'COMPLETED') {
    // Tampilkan hasil!
    setRun(latestRun);
    break;
  }
  
  // Tunggu 3 detik
  await sleep(3000);
}
```

Backend response untuk `/api/runs/pull-request/1`:
```json
[
  {
    "id": 1,
    "pullRequestId": 1,
    "status": "COMPLETED",
    "commitSha": "abc123...",
    "findings": [
      {
        "id": 1,
        "filePath": "src/utils/auth.js",
        "lineNumber": 45,
        "severity": "HIGH",
        "category": "SECURITY",
        "title": "Hardcoded credentials",
        "description": "Jangan hardcode password",
        "codeSnippet": "const password = '12345';",
        "suggestedPatches": [
          {
            "id": 1,
            "explanation": "Gunakan environment variable process.env.PASSWORD"
          }
        ]
      }
    ]
  }
]
```

### STEP 9: Frontend Tampilkan Hasil

```tsx
<div>
  <h3>Analysis Run</h3>
  <p>Status: COMPLETED</p>
  
  <h4>Files involved</h4>
  <ul>
    <li>src/utils/auth.js</li>
  </ul>
  
  <h4>Findings & Recommendations</h4>
  
  <div className="finding">
    <strong>Hardcoded credentials</strong> (HIGH · SECURITY)
    <p>File: src/utils/auth.js · line 45</p>
    <p>Jangan hardcode password</p>
    
    <pre><code>const password = '12345';</code></pre>
    
    <div>
      <strong>Suggested patches:</strong>
      <ul>
        <li>Gunakan environment variable process.env.PASSWORD</li>
      </ul>
    </div>
  </div>
</div>
```

---

## Komponen Sistem

### Frontend (React + TypeScript)

**File penting:**
- `App.tsx` - Main component, handle user input & display results
- `api.ts` - HTTP client untuk call backend API
- `main.tsx` - Entry point

**Dependencies:**
- React 18
- TypeScript
- Vite (build tool)

### Backend (Spring Boot + Java)

**Controllers** (Handle HTTP requests):
- `GitHubSyncController` - Sync PR dari GitHub
- `RunController` - Get analysis results
- `PullRequestController` - Manage PRs
- `RepoController` - Manage repositories

**Services** (Business logic):
- `GitHubApiService` - Call GitHub API
- `RunnerService` - Clone repo & trigger analysis
- `AnalysisService` - Analisis kode & detect issues

**Repositories** (Database access):
- `RepoRepository`
- `PullRequestRepository`
- `RunRepository`
- `FindingRepository`
- `SuggestedPatchRepository`

### Database (PostgreSQL)

**Tables:**
- `repos` - Repository yang di-track
- `pull_requests` - PR dari GitHub
- `runs` - Analysis runs
- `findings` - Issues yang ditemukan
- `suggested_patches` - Recommended fixes

### Infrastructure

**Docker Containers:**
- `frontend` - Nginx + React app (port 3000)
- `backend` - Spring Boot app (port 8080)
- `db` - PostgreSQL database (port 5432)

**Nginx** - Reverse proxy:
- Serve static files (HTML, JS, CSS)
- Forward `/api/*` ke backend

---

## API Endpoints Utama

### 1. Sync Pull Request
```
POST /api/github/sync/{owner}/{repo}/pr/{prNumber}

Example:
POST /api/github/sync/facebook/react/pr/27000

Response:
{
  "success": true,
  "repository": "facebook/react",
  "prNumber": 27000,
  "prTitle": "Bump semver...",
  "message": "PR fetched and queued"
}
```

### 2. Get Repositories
```
GET /api/repos

Response:
[
  {
    "id": 1,
    "name": "facebook/react",
    "cloneUrl": "https://github.com/facebook/react.git"
  }
]
```

### 3. Get Pull Requests for Repo
```
GET /api/pullrequests/repo/{repoId}

Example:
GET /api/pullrequests/repo/1

Response:
[
  {
    "id": 1,
    "repoId": 1,
    "prNumber": 27000,
    "title": "Bump semver...",
    "author": "dependabot[bot]"
  }
]
```

### 4. Get Analysis Runs for PR
```
GET /api/runs/pull-request/{pullRequestId}

Example:
GET /api/runs/pull-request/1

Response:
[
  {
    "id": 1,
    "pullRequestId": 1,
    "status": "COMPLETED",
    "findings": [
      {
        "filePath": "src/file.js",
        "lineNumber": 45,
        "severity": "HIGH",
        "title": "Security issue",
        "suggestedPatches": [...]
      }
    ]
  }
]
```

---

## Environment Variables

### Backend
```yaml
GITHUB_TOKEN=ghp_your_token_here         # GitHub Personal Access Token
OPENAI_API_KEY=sk-your_key_here          # Optional, untuk AI analysis
DATABASE_URL=jdbc:postgresql://db:5432/aicodereview
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
SPRING_PROFILES_ACTIVE=local
```

### Frontend
```yaml
VITE_API_BASE_URL=/api
```

---

## Cara Menjalankan

### Via Docker (Recommended)
```bash
cd c:\Users\aekmo\Downloads\Patch_Pilot
docker-compose up --build
```

Buka browser: http://localhost:3000

### Manual (Development)

**Backend:**
```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_DB=aicodereview \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## Troubleshooting

### Backend Health DOWN
```bash
# Cek logs
docker-compose logs backend --tail 50

# Cek database connection
docker exec patch_pilot-db-1 psql -U postgres -d aicodereview -c "SELECT 1;"
```

### 404 Error pada API
```bash
# Test direct ke backend
curl http://localhost:8080/api/actuator/health

# Test via nginx
curl http://localhost:3000/api/actuator/health
```

### GitHub API Error
- Pastikan repository public ATAU set GITHUB_TOKEN
- Cek rate limit: https://api.github.com/rate_limit

### Analysis Timeout
- Analysis bisa lama untuk repo besar
- Default timeout: 90 detik
- Cek logs: `docker-compose logs backend | grep -i analysis`

---

## Tips Penggunaan

1. **Untuk Repo Private**: Set `GITHUB_TOKEN` environment variable
2. **Rate Limiting**: Authenticated requests = 5000/hour vs 60/hour
3. **Analysis Speed**: Tergantung ukuran PR (jumlah file & lines changed)
4. **AI Analysis**: Set `OPENAI_API_KEY` untuk rekomendasi lebih cerdas

---

## Security Best Practices

1. Jangan commit GITHUB_TOKEN ke Git
2. Gunakan environment variables untuk secrets
3. Update dependencies secara berkala
4. Review findings sebelum apply patches
5. Backup database secara berkala
