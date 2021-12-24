# discord.bots.gg Node SDK

Unofficial module for interacting with the Discord.bots.gg API
beatX utilises this exact module

### Disclaimer

This module is based on the code of the Top.gg SDK available [here](https://github.com/top-gg/node-sdk)
However, the codebase has been modified to work with the discord.bots.gg API

# Installation

`yarn add @beatx/dbots-api` or `npm i @beatx/dbots-api`

# Introduction

The base client is dbots.Api, and it takes your Discord.bots.gg token and provides you with plenty of methods to interact with the API.

Your Discord.bots.gg token can be found at `https://discord.bots.gg/docs` and copying the token.

# Links

[~~Documentation~~](#) *coming soon*

[API Reference](https://discord.bots.gg/docs/endpoints) | [GitHub](https://github.com/beatx-bot/discordbots-node-sdk) | [NPM](https://npmjs.com/package/@beatx/dbots-sdk)

# Popular Examples

## Auto-Posting stats

If you're looking for an easy way to post your bot's stats (server count, shard count), check out [`@beatx/dbots-autoposter`](https://github.com/beatx-bot/discordbots-autoposter)

```js
const client = Discord.Client() // Your discord.js client or any other
const { AutoPoster } = require('@beatx/dbots-autoposter')

AutoPoster('dbots-token', client)
  .on('posted', () => {
    console.log('Posted stats to Discord.bots.gg!')
  })
```
With this your server count and shard count will be posted to Discord.bots.gg
