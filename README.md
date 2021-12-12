# node hook action

[![NPM](https://nodei.co/npm/node-hook-action.png?compact=true)](https://npmjs.org/package/node-hook-action)

Provide a simple Express Node application that listen for incoming queries (Webhooks). 
A flat json config file define shell action to do on incoming queries.

Node-hook-action supports:
- github webhooks,
- header value condition,
- json payload value condition.

Inspired by [RazvanCristian/node-git-webhook](https://github.com/RazvanCristian/node-git-webhook/blob/master/src/index.ts)

## How to use ?

- create a sample webhook configuration file. Like [config.json](config.json)
- install node-hook-action as dependency

```
npm install node-hook-action
```

- run the server.
```
node -e 'require("node-hook-action")()'
```

- try the client in another console !
```
# if you didn't clone the repository, simply copy examples/ scripts
./examples/webhookPostExample.sh
```

## JSON config file content

* `server_config` : Hook Express server config 
* `server_config.path` : Webhook path 
* `server_config.secret` : which kind of secret does your webhook queries are using ? at least one secret must be filled.
* `server_config.secret.github` : to set when using github webhooks. Set github webhook secret value here.
* `server_config.secret.custom` : to match a simple post `x-token` header value.
* `server_config.directories.logs` : logs directory (optional): to set if you would like to log into a dedicated 
directory in addition to console logs.
* `actions`: setup one or more actions or conditional actions to do on webhook reception.
* `actions.headers`: action headers (key/value) condition.
* `actions.payload`: action payload condition. 
The key is a [valid json path](https://www.npmjs.com/package/jsonpath).
The value is an expected string at json path location in webhook JSON payload. 
* `actions.events`: per event action(s). 
* `actions.events.event`: (github use case) value of `x-github-event` header. (custom use case) set to `custom`
* `actions.events.action`: shell command to execute.
* `actions.events.action.async=true`: shell async command to execute.

There is a ready to use [config.json](config.json) at root directory, that match related [examples](./examples), 
and [tests](./tests).

## How to contribute

You're not a dev ? just submit an issue (bug, improvements, questions). Or else:
* Clone or play with [codesandbox](https://codesandbox.io/s/node-hook-action-vwinq)
* Manual tests
```
npm start
# or
# ./bin/www
# then play samples
./examples/xxxx.sh
```
* Mocha tests
```
npm run test
```
* you could also fork, feature branch, then submit a pull request.


### Services or activated bots

| badge  | name   | description  |
|--------|-------|:--------|
| [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com)|[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
| ![CI/CD](https://github.com/creharmony/node-hook-action/actions/workflows/main.yml/badge.svg) |Github actions|Continuous tests.
| [![Audit](https://github.com/creharmony/node-hook-action/actions/workflows/audit.yml/badge.svg)](https://github.com/creharmony/node-hook-action/actions/workflows/audit.yml) |Github actions|Continuous vulnerability audit.
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)|[gren](https://github.com/github-tools/github-release-notes)|[Release notes](https://github.com/creharmony/node-hook-action/releases) automation|