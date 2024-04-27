# DONTRIBUTION.md

## Welcome

If you would like to contribute to the project then I welcome all support. If you are (or would like to be) a developer, then hit us up on Matrix (preferred) or Discord and we can help get you up and running.

**Matrix Rooms:**

- [#actor-export-general:matrix.elaba.net](https://matrix.to/#/#actor-export-general:matrix.elaba.net)
- [#actor-export-pf2e:matrix.elaba.net](https://matrix.to/#/#actor-export-pf2e:matrix.elaba.net)
- [#actor-export-dnd5e:matrix.elaba.net](https://matrix.to/#/#actor-export-dnd5e:matrix.elaba.net)

**Discord Channel:**

- [actor-export](https://discord.gg/6U89NQrtyS)

## Setup

This is a very simple JavaScript project, so there is nothing else than to fork the repository and create a new branch.

## How to Help

As a project, we are using a modified gitlab flow, with a development branch (`main`) for development. If you want to make improvements to the project, you can make a fork of the project in GitHub, and create a new branch. Then push your branch to GitHub and open a pull request for your branch to our development (`main`) branch. After being reviewed it can be pulled into the project by one of the project maintainers.

### Pull Requests

Pull requests ("PRs") can be made by anyone. PRs titles should be in imperative mood and state clearly and concisely what is being changed. A description is often needed to expand on any details. For new contributors, CI actions must be manually triggered by the system maintainers. It will automatically trigger for subsequent pull requests after a first one is merged into `main`.

#### Prettier

We have integrated [Prettier](https://prettier.io/) into this project to enforce a consistent coding—even if it's not one everybody likes. Github CI will block merges of any PR that fails the test suite, which includes style linting.
