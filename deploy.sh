#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DEPLOY_HOST="${DEPLOY_HOST:-47.99.94.123}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/html/rosydawn}"
DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-https://www.rosydawn.space}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-/private/tmp/rosydawn-deploy-key}"

DO_COMMIT=true
DO_PUSH=true
DO_VERIFY=true
COMMIT_MESSAGE=""

usage() {
  cat <<'EOF'
Usage:
  ./deploy.sh "commit message"

Options:
  --deploy-only   Build and deploy without git commit or push
  --no-commit     Build and deploy without git commit
  --no-push       Commit locally but do not push
  --no-verify     Skip curl verification after deploy
  -h, --help      Show this help

Environment:
  DEPLOY_HOST       Default: 47.99.94.123
  DEPLOY_USER       Default: root
  DEPLOY_PORT       Default: 22
  DEPLOY_PATH       Default: /var/www/html/rosydawn
  DEPLOY_DOMAIN     Default: https://www.rosydawn.space
  DEPLOY_SSH_KEY    Default: /private/tmp/rosydawn-deploy-key

Examples:
  ./deploy.sh "content: add langgraph placeholder"
  ./deploy.sh --deploy-only
  DEPLOY_SSH_KEY=~/.ssh/rosydawn_aliyun ./deploy.sh "site: update articles"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --deploy-only)
      DO_COMMIT=false
      DO_PUSH=false
      shift
      ;;
    --no-commit)
      DO_COMMIT=false
      shift
      ;;
    --no-push)
      DO_PUSH=false
      shift
      ;;
    --no-verify)
      DO_VERIFY=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -z "$COMMIT_MESSAGE" ]]; then
        COMMIT_MESSAGE="$1"
      else
        COMMIT_MESSAGE="$COMMIT_MESSAGE $1"
      fi
      shift
      ;;
  esac
done

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command git
require_command npm
require_command rsync
require_command ssh

if [[ "$DO_VERIFY" == true ]]; then
  require_command curl
fi

if [[ -z "$COMMIT_MESSAGE" ]]; then
  COMMIT_MESSAGE="site: update $(date '+%Y-%m-%d %H:%M:%S')"
fi

REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
SSH_ARGS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)

if [[ -n "$DEPLOY_SSH_KEY" && -f "$DEPLOY_SSH_KEY" ]]; then
  SSH_ARGS=(-i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes "${SSH_ARGS[@]}")
elif [[ -n "$DEPLOY_SSH_KEY" ]]; then
  echo "Warning: DEPLOY_SSH_KEY not found: $DEPLOY_SSH_KEY"
  echo "Falling back to your default ssh config/agent."
fi

printf -v RSYNC_SSH '%q ' ssh "${SSH_ARGS[@]}"

echo "==> Building site"
npm run build

if [[ "$DO_COMMIT" == true ]]; then
  echo "==> Staging git changes"
  git add -A

  if git diff --cached --quiet; then
    echo "==> No git changes to commit"
  else
    echo "==> Committing: $COMMIT_MESSAGE"
    git commit -m "$COMMIT_MESSAGE"
  fi

  if [[ "$DO_PUSH" == true ]]; then
    BRANCH="$(git branch --show-current)"
    if [[ -z "$BRANCH" ]]; then
      echo "Skipping push: detached HEAD"
    elif git remote get-url origin >/dev/null 2>&1; then
      echo "==> Pushing origin/$BRANCH"
      git push origin "$BRANCH"
    else
      echo "Skipping push: remote 'origin' not found"
    fi
  fi
else
  echo "==> Skipping git commit"
fi

echo "==> Ensuring remote directory exists"
ssh "${SSH_ARGS[@]}" "$REMOTE" "mkdir -p '$DEPLOY_PATH'"

echo "==> Syncing dist/ to ${REMOTE}:${DEPLOY_PATH}/"
rsync -az --delete -e "$RSYNC_SSH" dist/ "${REMOTE}:${DEPLOY_PATH}/"

if [[ "$DO_VERIFY" == true ]]; then
  echo "==> Verifying ${DEPLOY_DOMAIN}/"
  HTTP_CODE="$(curl -L -s -o /dev/null -w '%{http_code}' "${DEPLOY_DOMAIN}/")"
  if [[ "$HTTP_CODE" != "200" ]]; then
    echo "Verification failed: ${DEPLOY_DOMAIN}/ returned HTTP $HTTP_CODE" >&2
    exit 1
  fi
  echo "==> Verification passed: HTTP 200"
fi

echo "==> Deploy complete"
