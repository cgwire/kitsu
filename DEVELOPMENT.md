### Kitsu development environment

The [original documentation](https://kitsu.cg-wire.com/development-environment/) for setting up Kitsu includes setting up a significant amount of tooling on the local system - e.g. node.js, 900+ (!) dependencies, postgres, redis, FFMPEG and more.

The below method involves just `git` and `docker`.

1. Clone Kitsu
1. Edit to support Dockerised Zou
1. Create Docker volume
1. Run Docker build environment

<br>

### Usage

We'll clone Kitsu and use it to override the Kitsu from the already Dockerised distribution of CGWire.

```bash
docker run -d --rm -p 80:80 --name cgwire cgwire/cgwire
git clone https://github.com/cgwire/kitsu.git
cd kitsu
```

From here we need to modify the setup script of Kitsu, to use Zou via Docker container instead of a local version.

<details>
  <summary>On Windows?</summary>
<br>
If you are using Docker Toolbox on Windows, save this to <code>kitsu.patch</code> and run <code>git am < kitsu.patch</code>.

<pre>
From ef2921f40ae1ba5de54fc21bcb3cb52f6e32ab7b Mon Sep 17 00:00:00 2001
From: Marcus Ottosson <marcus@weightshift.io>
Date: Thu, 5 Jul 2018 13:49:27 +0100
Subject: [PATCH] Use Dockerised Zou

---
 config/index.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

diff --git a/config/index.js b/config/index.js
index 05fbc20..878e16e 100644
--- a/config/index.js
+++ b/config/index.js
@@ -29,14 +29,14 @@ module.exports = {
     assetsPublicPath: '/',
     proxyTable: {
       '/api': {
-        target: 'http://127.0.0.1:5000',
+        target: 'http://192.168.99.100/api',
         changeOrigin: true,
         pathRewrite: {
           '^/api': ''
         }
       },
       '/socket.io': {
-        target: 'http://127.0.0.1:5001',
+        target: 'http://192.168.99.100/socket.io',
         ws: true
       }
     },
-- 
2.16.1.windows.3
</pre>

</details>

<br>

Next, install volume and kick of the build pipeline.

```bash
# Setup volume
docker run -ti --rm \
    -v $(pwd):/workdir \
    -v cgwire-volume:/workdir/node_modules \
    --workdir=/workdir \
    node:6-alpine npm install --only=dev

# Install missing dependencies
docker run -ti --rm \
    -v $(pwd):/workdir \
    -v cgwire-volume:/workdir/node_modules \
    --workdir=/workdir \
    node:6-alpine npm install --save \
        async \
        chart.js \
        color-hash \
        marked \
        moment-timezone \
        superagent \
        thenby \
        eslint-plugin-import \
        eslint-plugin-node \
        vue \
        vue-chartkick \
        vue-feather-icons \
        vue-i18n \
        vue-infinite-scroll \
        vue-lazyload \
        vue-meta \
        vue-router \
        vue-scroll \
        vue-websocket \
        vuex \
        vuex-router-sync

# Run
docker run -ti --rm \
    --volume $(pwd):/workdir \
    --volume cgwire-volume:/workdir/node_modules \
    --workdir=/workdir \
    --publish 8080:8080 \
    node:6-alpine npm run dev
```

The initial build takes 60-90 seconds (!) on my machine.

Once finished, goto http://192.168.99.100:8080

**Live Updates**

File system events don't make it into to the Docker container. So when you update a file, you must kill the continer and spend another 60-90 seconds rebuilding.

Or, you can "touch" a file from within the container.

```bash
# From a separate shell, keeping the above one running
alias dtouch="docker run -ti --rm \
    --volume $(pwd):/workdir \
    --workdir /workdir \
    --entrypoint /usr/bin/env \
    node:6-alpine touch $*"
dtouch src\components\Asset.vue
```

<br>

### Notable things

1. Dependencies are installed into a Docker volume. An alternative is installing them into the local directory and mounting it. However some dependenceis utilise *symlinks* that don't translate into the Docker environment.
1. The kitsu repository is mounted into the build environment, such that you can work with it locally.
2. The dependencies are mounted *into a subdirectory of the kitsu repository*. This is the part that is a little mindbending; the local directory looks different to the container than it does to us. The reason is that the dependencies *must* be present in a `node_modules/` directory of the working directory, while at the same time the working directory just so happens to be where we work.
