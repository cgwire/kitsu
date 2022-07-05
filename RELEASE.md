# How to create a new release for Kitsu

We release Kitsu versions through Github. Every time a new version is ready, we
follow this process:

1. Rebase sources on the master branch.
2. Up the version number through the `npm` CLI. 
3. Tag the commit with the Kitsu version.
4. Push changes to `master` branch.

You can run the following script to perform these commands at once:

```bash
git pull --rebase origin master
npm version patch
git push origin master --tag
```


# Deployment

Kitsu installation have to update via Git, your Kitsu folder. Run the following
command to get the latest version of Kitsu:

```bash
git pull --rebase origin build
```
