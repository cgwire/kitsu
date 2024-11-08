# How to create a new release for Kitsu

We release Kitsu versions through GitHub.
Every time a new version is ready, we follow this process:

1. Rebase sources on the `main` branch.
2. Up the version number through the `npm` CLI.
3. Tag the commit with the Kitsu version.
4. Push changes to the `main` branch.

You can run the following script to perform these commands at once:

```bash
git pull --rebase origin main
npm version patch
git push origin main --tag
```

# Deployment

Kitsu installation has to be updated via Git, your Kitsu folder.
Run the following command to get the latest version of Kitsu:

```bash
git pull --rebase origin build
```
