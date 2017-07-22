[![Kitsu](https://kitsu.cg-wire.com/img/kitsu.png)](https://kitsu.cg-wire.com)

# Kitsu, CG Production Manager

Kitsu is a web tool to improve validation tracking in CG productions. By
offering a clean UI and a shared database, it allows you to communicate
efficiently with all the shareholders of the production: CG artists, 
production managers, TDs, supervisors and clients

![Build badge](https://travis-ci.org/cgwire/kitsu.svg?branch=master)

# Documentation 

For further information about features and installation, please refer to the
documentation website.

![Documentation](https://kitsu.cg-wire.com/)

## Contributing

All contributions are welcome as long as they respect the [C4
contract](https://rfc.zeromq.org/spec:42/C4).

The Kitsu code is written with Javascript (ES6) and is based on the 
[VueJS](https://vuejs.org/v2/guide/) framework extended with 
the [Vuex](https://vuex.vuejs.org) plugin.

We chosed this technology for its clear and exhaustive documentation.

### Setting up a development environment

Prior to setting up the Kitsu development environment make sure you have to
the following elements installed:

* Node.js 6.x
* A Zou development instance up and running on port 5000

Get the Kitsu sources:

```bash
git clone git@github.com:cgwire/kitsu.git
```

Then install dependencies (make sure you have Node.js 6.x installed):

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

You can now use Kitsu by connecting to `http://localhost:8080`.

There is an automatic build after each change. It will display an error if you
did a syntax or a style error. If the build is properly done, the page is
automatically updated. 

## About authors

Kitsu is written by CG Wire, a company based in France. We help small to
midsize CG studios to manage their production and build pipeline efficiently.

We apply software craftmanship principles as much as possible. We love coding
and consider that strong quality and good developer experience matter a lot.
Our extensive experience allows studios to get better at doing software and
focus more on the artistic work.

Visit [cg-wire.com](https://cg-wire.com) for more information.

[![CGWire Logo](https://zou.cg-wire.com/cgwire.png)](https://cg-wire.com)
