# CI/CD — auto-deploy on push to `main`

Push to `main` → GitHub Actions builds the frontend, ships it to the droplet,
updates the backend/pricing source, reloads PM2, health-checks, and rolls back
automatically if the site doesn't come back up.

- Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- Droplet-side script: [`deploy/deploy-remote.sh`](./deploy-remote.sh)
- Droplet: `root@209.38.102.94`, repo at `/root/united-hotels-prod`

The build runs on the GitHub runner (not the droplet — the 512 MB box OOMs on
`next build`). Everything else mirrors the manual flow in `DEPLOY_NEXT.md`.

---

## One-time setup (do this BEFORE the first push, or the deploy step fails)

### 1. Make a dedicated SSH deploy key

On your **laptop** (Git Bash or PowerShell), in any scratch folder:

```bash
ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-actions-deploy"
```

This creates `deploy_key` (private) and `deploy_key.pub` (public). No passphrase
(`-N ""`) — CI can't type one.

### 2. Authorize the public key on the droplet

SSH into the **droplet** and append the public key:

```bash
ssh root@209.38.102.94
# paste the ONE line from deploy_key.pub:
echo "ssh-ed25519 AAAA...github-actions-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 3. Add repository secrets on GitHub

Repo → **Settings → Secrets and variables → Actions → Secrets** → *New repository secret*:

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | the **entire** contents of the private `deploy_key` file (incl. the `-----BEGIN/END-----` lines) |
| `DEPLOY_HOST` | `209.38.102.94` |
| `DEPLOY_USER` | `root` |

### 4. (Optional) Add build-time frontend variables

Same page → **Variables** tab → *New repository variable*. These are PUBLIC
(they ship to the browser), so they're Variables, not Secrets. All optional —
an unset one just hides that feature. Common ones:

`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`,
`NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_IMAGEKIT_ENDPOINT`, … (full list is in the workflow's build step).

> Backend/pricing runtime secrets (`DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`,
> `ISBANK_*`, …) are **not** here — they live in `/root/united-hotels-prod/.env`
> on the droplet and stay there. `git reset --hard` never touches `.env` (it's
> gitignored).

### 5. Verify the droplet prerequisites (once)

```bash
ssh root@209.38.102.94
node -v                 # 20.x recommended (match the runner)
pm2 status              # backend, pricing-engine, frontend should exist
swapon --show           # 1G swapfile present (see DEPLOY_NEXT.md B1) — needed on 512MB
git -C /root/united-hotels-prod remote -v   # points at origin
```

---

## Using it

- **Deploy:** just `git push origin main`. Watch it under the repo's **Actions** tab.
- **Manual run (no code change):** Actions → *Deploy to production* → **Run workflow**.
- **Watch on the droplet:** `pm2 logs` / `pm2 status`.

## Rollback

The script auto-rolls-back on a failed health check. To roll back a *bad deploy
that still passed health checks* (e.g. a logic regression), revert on `main` and
push — that redeploys the previous good state:

```bash
git revert HEAD
git push origin main
```

## Guardrails baked in

- **Serialized deploys** — a second push waits for the first (no racing).
- **Atomic frontend swap** with a `.prev` copy kept for rollback.
- **Deps installed only when a lockfile changed** — keeps the small box quick.
- **Health-gated** — backend `:5000/api/health`, frontend `:3000/` and
  `:3000/api/health`; any failure triggers full rollback and a red build.

## Notes / gotchas

- **Node parity:** the runner uses Node 20; keep the droplet on Node 20 too so the
  standalone bundle's traced `node_modules` (incl. any native deps) matches.
- **The droplet repo is deploy-only.** Don't hand-edit files under
  `/root/united-hotels-prod` — `git reset --hard` will discard them. Change code
  via `main` and let CI deploy it.
- **First run:** if `backend` / `pricing-engine` aren't in PM2 yet, the script
  starts them; normally it just reloads.
