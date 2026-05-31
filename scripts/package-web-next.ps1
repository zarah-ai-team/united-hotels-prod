# Builds the Next.js frontend (web-next) as a self-contained standalone bundle
# and packages it into web-next-standalone.tar.gz for shipping to the droplet.
#
# Run on the LAPTOP (the 512MB droplet OOMs on `next build`):
#   powershell -ExecutionPolicy Bypass -File scripts\package-web-next.ps1
#
# NOTE: stop any running `next dev` for web-next first — it locks .next and the
# build will fail with EPERM.

$ErrorActionPreference = 'Stop'
$web = Resolve-Path (Join-Path $PSScriptRoot '..\web-next')
Set-Location $web

# Clean .next first — building standalone on top of a previously-assembled
# bundle (with public/ + static copied in) can make Next skip emitting server.js.
if (Test-Path '.next') { Remove-Item '.next' -Recurse -Force }

Write-Host '==> next build (standalone)...' -ForegroundColor Cyan
& npx next build
if ($LASTEXITCODE -ne 0) { throw "next build failed (exit $LASTEXITCODE)" }

$standalone = Join-Path $web '.next\standalone'
if (-not (Test-Path $standalone)) {
    throw "standalone output missing at $standalone — is output:'standalone' set in next.config.mjs?"
}

Write-Host '==> assembling bundle (public + .next/static)...' -ForegroundColor Cyan
$pubDst = Join-Path $standalone 'public'
if (Test-Path $pubDst) { Remove-Item $pubDst -Recurse -Force }
Copy-Item (Join-Path $web 'public') $pubDst -Recurse -Force

$staticDst = Join-Path $standalone '.next\static'
if (Test-Path $staticDst) { Remove-Item $staticDst -Recurse -Force }
Copy-Item (Join-Path $web '.next\static') $staticDst -Recurse -Force

$out = Join-Path $web 'web-next-standalone.tar.gz'
if (Test-Path $out) { Remove-Item $out -Force }

# Use a RELATIVE archive path (cwd is $web): a drive-letter colon in the -f arg
# makes GNU/bsd tar treat it as a remote host. -C is given the relative bundle
# dir for the same reason.
Write-Host "==> creating $out ..." -ForegroundColor Cyan
& tar -czf 'web-next-standalone.tar.gz' -C '.next/standalone' '.'
if ($LASTEXITCODE -ne 0) { throw "tar failed (exit $LASTEXITCODE)" }

$mb = [math]::Round((Get-Item $out).Length / 1MB, 1)
Write-Host "==> Done: $out ($mb MB)" -ForegroundColor Green
Write-Host 'Next: scp it to the droplet and follow deploy/DEPLOY_NEXT.md'
