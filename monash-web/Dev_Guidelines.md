# Repository Guidelines (Simple)

## Branches

* **main** → Production only
* **staging** → Pre-production testing
* **dev** → Default branch for development

> ❌ Direct push to `main` and `staging` is not allowed
> ✅ Only repo admin can merge into `main`

---

## Development Workflow

### 1. Clone Repository

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Switch to `dev`

```bash
git checkout dev
git pull origin dev
```

### 3. Create Feature Branch (from `dev`)

Branch format:

```
<type>/<optional-issue>-<short-title>
```

Examples:

* `feature/login`
* `bugfix/56-auth-error`
* `chore/update-deps`

```bash
git checkout -b feature/login
```

### 4. Do Development Work

* Code only in the feature branch
* Pull `dev` regularly to stay updated

```bash
git pull origin dev
git merge dev
```

### 5. Commit Changes

```bash
git add .
git commit -m "[feature]: add login page"
```

### 6. Push Feature Branch

```bash
git push origin feature/login
```

### 7. Merge Flow

* Create PR: `feature/*` → `dev`
* After testing, merge `dev` → `staging`
* Production release: `staging` → `main`

---

## Commit Message Format

```
[type]: short description
```

Types:

* feature
* bugfix
* hotfix
* refactor
* docs
* styles
* chore
* perf
* test
* build

Examples:

* `[feature]: add user login`
* `[bugfix]: fix token expiry issue`

---

## Do's and Don'ts

### ✅ Do

* Always create branches from `dev`
* Keep commits small and meaningful
* Pull latest changes before merging
* Use `.env.example`, never commit `.env`

### ❌ Don't

* Push directly to `main`, `staging`, or `dev`
* Mix unrelated changes in one commit
* Commit secrets or credentials

---

## Release Rule (Simple)

* `dev` → daily development
* `staging` → testing & UAT
* `main` → production only

---

> This workflow keeps development safe, clean, and production stable.
