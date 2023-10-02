set -e
git pull --rebase origin master
npm version patch
git push origin master --tag
