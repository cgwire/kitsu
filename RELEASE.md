# How to create a new release for Kitsu

We release Kitsu versions through Github. Every time a new version is ready, we
follow this process:

1. Rebase sources on the master branch.
2. Up the version number through the `npm` CLI. 
3. Push changes to `master` branch.
4. Run the Vue.js build.
5. Keep the build somewhere.
6. Switch to the `build` branch.
7. Replace the `dist` directory with the new one.
8. Tag the commit and push the changes to Github.

You can run the following script to perform these commands at once:

```bash
release_number=0.11.32
git pull --rebase origin master
npm version patch
git push origin master --tag
npm i
npm run build
mv dist ..
git checkout build
git pull --rebase origin build
rm -rf dist
mv ../dist .
git add dist
git commit -m "New release ($release_number)"
git tag $release_number-build
git push origin build --tag
git checkout master
```


# Deployment

Kitsu installation have to update via Git, your Kitsu folder. Run the following
command to get the latest version of Kitsu:

```bash
git pull --rebase origin build
```
