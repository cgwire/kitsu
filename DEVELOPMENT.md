### Kitsu Development Environment with Docker

Start developing for Kitsu using Docker on Windows, Linux and macOS.

**Prerequisites**

- [Node.js >= 20.19](https://nodejs.org)
- [Docker >= 1.13](https://store.docker.com/search?type=edition&offering=community)

**Setup**

```bash
docker run -d --rm -p 80:80 --name cgwire cgwire/cgwire
export KITSU_API_TARGET=http://$(docker-machine ip)/api
export KITSU_EVENT_TARGET=http://$(docker-machine ip)/socket.io
git clone https://github.com/cgwire/kitsu.git
cd kitsu
npm install
npm run dev
```

After 30 or so seconds, a browser window should appear with Kitsu up and running. The development server will rebuild files automatically as they are edited.

**Resources**

Kitsu is based on the Vue.js framework. The Vue.js documentation is exhaustive and very clear. We encourage you to read it before hacking significant piece of code.

The architecture is based on [vuex](https://kitsu.cg-wire.com/installation/#architecture) and [vue-router](https://kitsu.cg-wire.com/installation/#architecture). Documentations are good too, again, we recommend to read it. The main idea is that:

- URL routes gives the main context.
- Views are described in components through HTML, CSS and small pieces of JavaScript.
- Shared state is stored inside stores which are modified through mutations (kind of event bus to require state changes) and actions.
- Actions are similar to mutations but they allow asynchronous operations. Mainly actions fire mutations and send requests to the server.
- Stores provide getter to access state properties from components.
- Local changes logic is kept inside components.
- Getter, actions and mutations must be testable without browser.

**Help**

Come talk to us!

- [Join the Kitsu Community Discord](https://discord.com/invite/VbCxtKN)
