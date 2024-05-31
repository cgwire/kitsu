# Open Source Setup

## Cloud Hosting

If your version of Kitsu is hosted and maintained by CGWire, you don't have anything to install. Simply connect to the URL provided to you to start using Kitsu!

## Self-Hosting

To run properly, Kitsu requires Zou, the database API. Information related to the installation of both modules is located in the Zou installation documentation.

* [Deploying Zou](https://zou.cg-wire.com/)
* [Deploying Kitsu](https://zou.cg-wire.com/#deploying-kitsu)

If you have technical skills, you can run Kitsu/Zou through Docker to try it out:

```shell
docker run -d -p 80:80 --name cgwire cgwire/cgwire
```

Then you can access Kitsu through [http://localhost](http://localhost).

## Development Environment

### Prerequisites

Prior to setting up the Kitsu development environment, make sure you have the following elements installed:

* [Node.js](https://nodejs.org/en/) >= 18.12
* A [Zou development instance](https://zou.cg-wire.com/development/) up and running on port 5000
* A [Zou Events development instance](https://zou.cg-wire.com/development/) up and running on port 5001 (optional)

### Using Docker Image

You can use our [Docker image](https://hub.docker.com/r/cgwire/cgwire), but you will need to set two environment variables:

* `KITSU_API_TARGET` (default: http://localhost:5000): The URL where the API can be reached.
* `KITSU_EVENT_TARGET` (default: http://localhost:5001): The URL where the event stream can be reached.

In that case, run the development environment with the following command:

```shell
KITSU_API_TARGET=http://localhost/api KITSU_EVENT_TARGET=http://localhost npm run dev
```

The credentials for the Docker image are: admin@example.com / mysecretpassword

## Development

To start modifying Kitsu, clone the repository:

```shell
git clone https://github.com/cgwire/kitsu.git
```

Then download the dependencies:

```shell
cd kitsu
npm install
```

Finally, start the development environment and view the results at `http://localhost:8080`:

```shell
npm run dev
```

Any changes will automatically update the page.

## Build

To build your code, run this command:

```shell
npm run build
```

## Tests

Run tests with the following command:

```shell
npm run test:unit
```

## Architecture

Kitsu is based on the [Vue.js](https://v2.vuejs.org/v2/guide/) framework. The Vue.js documentation is exhaustive and very clear. We encourage you to read it before making significant changes to the code.

The architecture is based on [Vuex](https://v3.vuex.vuejs.org/) and [vue-router](https://v3.router.vuejs.org/). Their documentation is also very good, and we recommend reading it. The main idea is that:

* URL routes give the main context.
* Views are described in components through HTML, CSS, and small pieces of JavaScript.
* Shared state is stored inside stores, which are modified through mutations (a kind of event bus to request state changes) and actions.
* Actions are similar to mutations but allow asynchronous operations. Mainly, actions fire mutations and send requests to the server.
* Stores provide getters to access state properties from components.
* Local change logic is kept inside components.
* Getters, actions, and mutations must be testable without a browser.
