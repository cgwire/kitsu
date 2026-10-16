[![Kitsu](https://zou.cg-wire.com/kitsu.png)](https://kitsu.cg-wire.com)

# Kitsu, Collaboration Platform for Animation, VFX, and Video Game Studios

Kitsu is a web application that allows you to collaborate on your creative productions and
manage your deliveries. It improves the communication between all stakeholders.
Which leads to better results and faster shipping.

[![CI badge](https://github.com/cgwire/kitsu/actions/workflows/ci.yml/badge.svg)](https://github.com/cgwire/kitsu/actions/workflows/ci.yml)
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.com/invite/VbCxtKN)
[![Donation](https://img.shields.io/liberapay/receives/CGWire.svg?logo=liberapay">)](https://liberapay.com/CGWire/donate)

## Documentation

For further information about features and installation, please refer to the
[documentation website](https://kitsu.cg-wire.com/).

## Contributing

There are many ways to contribute to Kitsu, from simple tasks to most complex ones. We created a
[contributing guide](https://github.com/cgwire/kitsu/blob/main/CONTRIBUTING.md) explaining everything.
You will find all the information you are looking for!

## About authors

Kitsu is written by CGWire, a company based in France. We help animation and VFX studios to collaborate better through efficient tooling.

More than 300 studios around the world use Kitsu for their projects.

Visit [cg-wire.com](https://cg-wire.com) for more information.

## Local Task plugin extension proposal

The local `codex/task-detail-files-extension` branch adds a generic Task-detail plugin tab through `frontend_task_enabled` and a separate manager-only Production plugin route through `frontend_project_admin_enabled`. Ordinary Project pages continue to use `frontend_project_enabled`. The Kitsu hook passes selected Task identity as untrusted iframe context and does not authorize Plugin requests. This frontend-only proposal depends on an upstream Zou metadata/model/API change: pinned Zou 1.0.94 currently persists and returns only the Project and Studio frontend flags. The hook is not upstream or release-ready until both flags are supported and authenticated installed-host visual UAT passes.

[![CGWire Logo](https://zou.cg-wire.com/cgwire.png)](https://cg-wire.com)
