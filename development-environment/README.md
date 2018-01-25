# Development Environment

## Prerequisite

Prior to setting up the Kitsu development environment make sure you have
the following elements installed:

* Node.js 6.x or superior
* A [Zou development instance](https://zou.cg-wire.com/development/) up and running on port 5000
* A [Zou Events development instance](https://zou.cg-wire.com/development/) up and running on port 5001 (optional)


## Develop

To start modifying Kitsu, you need the sources:

```bash
git clone https://github.com/cgwire/kitsu.git
```

Then download the dependencies:

```bash
npm install
```

Finally start the development environment and see the result on
`http://localhost:8080`:

```bash
npm run dev
```

Every changes will automatically update the page.

## Build

If you want to build your code, simply run this command:

```bash
npm run build
```

If you need more details about the build:

```bash
npm run build --report
```


## Tests

Run tests with the following command:

```
npm run test:store
```

# Architecture

Kitsu is based on the VueJs framework. The VueJs documentation is exhaustive
and very clear. We encourage you to read it before hacking significant piece of
code.

The architecture is based on [vuex]() and [vue-router](). Documentations are
good too, again, we recommend to read it. The main idea is that:

* Url routes gives the main context.
* Views are described in components through HTML, CSS and small pieces of
  javascript.
* Shared state is stored inside stores which are modified through mutations
  (kind of event bus to require state changes) and actions.
* Actions are similar to mutations but they allow asynchronous operations.
  Mainly actions fire mutations and send requests to the server.
* Stores provide getter to access state properties from components.
* Local changes logic is kept inside components.
* Getter, actions and mutations must be testable without browser.
