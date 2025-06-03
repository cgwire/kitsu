set -e
git pull --rebase origin main
npm version patch
git push origin main --follow-tags
