git pull --rebase origin master
npm version minor
git push origin master --tag
npm run build
mv dist ..
git checkout build
git pull --rebase origin build
rm -rf dist
mv ../dist .
git add dist
git commit -m "New release (0.7.0)"
git tag 0.7.0-build
git push origin build --tag
git checkout master
