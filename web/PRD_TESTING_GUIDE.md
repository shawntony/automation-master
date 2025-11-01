# PRD Integration Testing Guide

## Setup

The development server is already running at http://localhost:3000

## Test Scenarios

### Scenario 1: File Upload Method ✅

**Steps:**
1. Navigate to http://localhost:3000/create-project
2. Step 1: Enter project name "test-file-upload" and select "Fullstack"
3. Click "다음" button
4. Step 2: Click "파일 업로드" tab
5. Drag and drop `web/test-prd.md` or click to select it
6. Verify file preview shows first 500 characters
7. Click "다음" button
8. Step 3: Review summary showing file upload method
9. Click "프로젝트 생성" button

**Expected Results:**
- Project created at `C:\Users\gram\myautomation\test-file-upload\`
- `docs/PRD.md` file exists with uploaded content
- `config/progress.json` shows step 1 as completed
- Success screen shows PRD path

**Verification Commands:**
```bash
# Check if project was created
ls /c/Users/gram/myautomation/test-file-upload/

# Check if PRD exists
cat /c/Users/gram/myautomation/test-file-upload/docs/PRD.md

# Check progress tracking
cat /c/Users/gram/myautomation/test-file-upload/config/progress.json | grep -A 5 "prd"
```

---

### Scenario 2: Idea Input Method ✅

**Steps:**
1. Navigate to http://localhost:3000/create-project
2. Step 1: Enter project name "test-idea-input" and select "Frontend"
3. Click "다음" button
4. Step 2: Click "아이디어 입력" tab
5. Enter idea text (min 20 characters):
   ```
   간단한 블로그 플랫폼을 만들고 싶습니다.
   사용자가 글을 작성하고 공유할 수 있으며,
   댓글과 좋아요 기능이 있어야 합니다.
   ```
6. Click "AI로 PRD 자동 생성" button
7. Review generated PRD preview
8. Click "다음" button
9. Step 3: Review summary
10. Click "프로젝트 생성" button

**Expected Results:**
- Project created with auto-generated PRD
- PRD includes placeholders for user to fill in later
- PRD format follows template structure

**Verification Commands:**
```bash
# Check generated PRD
cat /c/Users/gram/myautomation/test-idea-input/docs/PRD.md

# Should contain the idea and basic structure
grep "아이디어" /c/Users/gram/myautomation/test-idea-input/docs/PRD.md
```

---

### Scenario 3: Form Wizard Method ✅

**Steps:**
1. Navigate to http://localhost:3000/create-project
2. Step 1: Enter project name "test-form-wizard" and select "Backend"
3. Click "다음" button
4. Step 2: Click "단계별 폼" tab
5. Fill out the form:
   - **프로젝트 목적** (required): "RESTful API 개발을 위한 백엔드 시스템"
   - **배경** (optional): "현재 모놀리식 구조를 마이크로서비스로 전환"
   - **주요 기능** (required):
     - "사용자 인증 API"
     - "데이터 CRUD API"
     - "파일 업로드 API"
   - **타겟 사용자** (required): "프론트엔드 개발팀"
   - **기술 스택** (required):
     - "Node.js"
     - "Express"
     - "PostgreSQL"
     - "Redis"
   - **성공 지표** (optional): "API 응답 시간 < 100ms"
   - **제약사항** (optional): "레거시 DB와 호환 필요"
6. Click "PRD 폼 작성 완료" button
7. Review form summary
8. Click "다음" button
9. Step 3: Review summary showing feature count and tech count
10. Click "프로젝트 생성" button

**Expected Results:**
- PRD generated from structured form data
- All form fields properly included in PRD
- Feature list formatted as markdown sections

**Verification Commands:**
```bash
# Check form-generated PRD
cat /c/Users/gram/myautomation/test-form-wizard/docs/PRD.md

# Verify features are listed
grep -A 10 "주요 기능" /c/Users/gram/myautomation/test-form-wizard/docs/PRD.md

# Verify tech stack
grep -A 5 "기술 스택" /c/Users/gram/myautomation/test-form-wizard/docs/PRD.md
```

---

### Scenario 4: Skip PRD Method ✅

**Steps:**
1. Navigate to http://localhost:3000/create-project
2. Step 1: Enter project name "test-skip-prd" and select "Automation"
3. Click "다음" button
4. Step 2: Click "나중에 작성" tab
5. Read the warning message about creating PRD later
6. Click "다음" button
7. Step 3: Review summary showing "나중에 작성"
8. Click "프로젝트 생성" button

**Expected Results:**
- Project created without PRD
- `docs/` folder exists but is empty
- `config/progress.json` shows step 1 as pending (not completed)
- Success screen does NOT show PRD path

**Verification Commands:**
```bash
# Check if docs folder exists but is empty
ls /c/Users/gram/myautomation/test-skip-prd/docs/

# Progress should show step 1 as pending
cat /c/Users/gram/myautomation/test-skip-prd/config/progress.json | grep -A 3 "stepId\": 1"
```

---

## Validation Tests

### Test 1: Project Name Validation ✅

**Steps:**
1. Try to enter invalid project names:
   - Empty name
   - Name with spaces: "my project"
   - Name with special chars: "my@project"
   - Name with Korean: "내프로젝트"

**Expected:**
- Error message appears
- Cannot proceed to next step

---

### Test 2: PRD Form Validation ✅

**Steps:**
1. In form wizard, try to submit without:
   - Purpose (required field)
   - Features (required field)
   - Target users (required field)
   - Tech stack (required field)

**Expected:**
- Error messages appear for each missing field
- Cannot complete form submission

---

### Test 3: File Upload Validation ✅

**Steps:**
1. Try to upload invalid files:
   - File with .pdf extension
   - File larger than 5MB

**Expected:**
- Error message for unsupported format
- Error message for file too large

---

## API Testing

### Direct API Test

```bash
# Test file upload method
curl -X POST http://localhost:3000/api/create-project \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "api-test-file",
    "projectType": "fullstack",
    "prdOptions": {
      "method": "file",
      "fileUpload": {
        "fileName": "PRD.md",
        "content": "# Test PRD\n\n## Purpose\nTest project from API"
      }
    }
  }'

# Test idea method
curl -X POST http://localhost:3000/api/create-project \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "api-test-idea",
    "projectType": "frontend",
    "prdOptions": {
      "method": "idea",
      "ideaInput": {
        "idea": "간단한 Todo 앱을 만들고 싶습니다. 할일 추가, 삭제, 완료 표시 기능이 필요합니다."
      }
    }
  }'

# Test form method
curl -X POST http://localhost:3000/api/create-project \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "api-test-form",
    "projectType": "backend",
    "prdOptions": {
      "method": "form",
      "formData": {
        "purpose": "API 백엔드 시스템 개발",
        "features": ["인증 API", "CRUD API", "검색 API"],
        "targetUsers": "모바일 앱 개발팀",
        "techStack": ["Node.js", "Express", "MongoDB"]
      }
    }
  }'

# Test skip method
curl -X POST http://localhost:3000/api/create-project \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "api-test-skip",
    "projectType": "automation",
    "prdOptions": {
      "method": "skip"
    }
  }'
```

---

## Progress Tracking Verification

After creating a project with PRD, verify progress.json:

```bash
cat /c/Users/gram/myautomation/test-*/config/progress.json
```

**Expected structure:**
```json
{
  "projectName": "test-xxx",
  "createdAt": "2025-11-01T...",
  "currentStep": 2,  // Should be 2 when PRD exists
  "steps": [
    {
      "stepId": 1,
      "status": "completed",  // Should be "completed" when PRD exists
      "checklist": []
    },
    ...
  ],
  "prd": {
    "path": "docs/PRD.md",
    "createdAt": "2025-11-01T..."
  }
}
```

---

## Success Criteria

All tests pass if:

1. ✅ All 4 PRD input methods work correctly
2. ✅ PRD files are saved to `docs/PRD.md`
3. ✅ Progress tracking updates correctly
4. ✅ Validation prevents invalid inputs
5. ✅ API endpoint handles all PRD options
6. ✅ Success screen shows correct information
7. ✅ TypeScript compiles without errors in new code
8. ✅ UI navigation works smoothly between steps

---

## Cleanup Test Projects

After testing, you can remove test projects:

```bash
rm -rf /c/Users/gram/myautomation/test-*
rm -rf /c/Users/gram/myautomation/api-test-*
```

---

## Known Issues

None in PRD integration code. Existing TypeScript errors are in other parts of the codebase (SSA tools, etc.) and do not affect PRD functionality.
