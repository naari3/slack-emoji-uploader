# slack-emoji-uploader

Upload emoji to Slack in node.

[![npm version](https://badge.fury.io/js/slack-emoji-uploader.svg)](https://badge.fury.io/js/slack-emoji-uploader)

## Install

```
$ npm i slack-emoji-uploader
```

## Usage

### SlackTokenGetter

```javascript
const { SlackTokenGetter } = require("slack-emoji-uploader");

tokenGetter = new SlackTokenGetter("team_name");
tokenGetter.getApiToken("email", "password").then((apiToken) => console.log(apiToken));
// xoxs-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SlakEmojiUploader

```javascript
const { SlakEmojiUploader } = require("slack-emoji-uploader");
const fs = require("fs");

emojiUploader = new SlakEmojiUploader("team_name", apiToken);

const img = fs.readFileSync("/path/to/image.png")
emojiUploader.upload("emoji_name", img)
```
