# node hook action

Provide a simple Express Node application that listen for incomming query (Webhooks). A flat json config file define shell action to do on incomming query.
- support github webhooks,
- support header value condition,
- support json payload value condition.

Inspired by [RazvanCristian/node-git-webhook](https://github.com/RazvanCristian/node-git-webhook/blob/master/src/index.ts)

## How to use ?

- create a sample webhook configuration file. Like [config.json](config.json)
- install me

```
npm install node-hook-action
```

- run me !
```
node -e 'require("node-hook-action")()'
```

- try me :
```
./simpleSecretSample.sh
```
## JSON config file values

* `server_config` : Express app config 
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
