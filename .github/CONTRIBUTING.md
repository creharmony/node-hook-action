[ < Back](../README.md)

# HowTo Contribute

Please create an [issue](https://github.com/creharmony/node-hook-action/issues) describing your goal / question / bug description...

If you're interested in an existing issue, please contribute by up-voting for it by adding a :+1:.

If you want to push some code :
- fork and prepare a feature-git-branch, then create a [pull request](https://github.com/creharmony/node-hook-action/pulls) that link your issue.
- execute test and linter

You could also be critic with existing ticket/PR : all constructive feedbacks are welcome.

## test
* (legacy) manual play/experiment with [codesandbox](https://codesandbox.io/s/node-hook-action-vwinq)
* launch tests using `pnpm test`. 

Think about environment setup.


## HowTo create a fresh version
- use patch or minor or major workflow

this will make a new version and on version tag, the main ci workflow will push a new npmjs version too.

## HowTo release using `gh`

Install and create automatically a draft release version using [gh client](https://cli.github.com/)
- the version tag must exist

Example to create v1.1.0
```bash
gh release create v1.1.0 --draft --generate-notes
```
this will make a new draft release. Verify it in [releases list](https://github.com/creharmony/node-hook-action/releases)

- ⚠️ the repository apply immutable releases since #15 (`v1.1.0`), so you can't modify a release once published
- publish the release when ready