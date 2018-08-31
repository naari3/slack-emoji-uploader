const axios = require("axios");
const FormData = require("form-data");

const urljoin = require("url-join");

const SLACK_DOMAIN = "slack.com";
const SLACK_EMOJI_ADD_API = "api/emoji.add";
const SLACK_EMOJI_REMOVE_API = "api/emoji.remove";

class SlackEmojiUploader {
  constructor(subdomain, apiToken) {
    this.subdomain = subdomain;
    this.origin = `https://${subdomain}.${SLACK_DOMAIN}`;
    this.apiToken = apiToken;
  }

  async upload(name, image) {
    const form = new FormData();
    form.append("mode", "data");
    form.append("name", name);
    form.append("image", image, `${name}.png`);
    form.append("token", this.apiToken);
    const response = await axios.request({
      url: urljoin(this.origin, SLACK_EMOJI_ADD_API),
      method: "post",
      headers: form.getHeaders(),
      data: form
    });
    return response.data;
  }

  async alias(name, alias_for) {
    const form = new FormData();
    form.append("mode", "alias");
    form.append("name", name);
    form.append("alias_for", alias_for);
    form.append("token", this.apiToken);
    const response = await axios.request({
      url: urljoin(this.origin, SLACK_EMOJI_ADD_API),
      method: "post",
      headers: form.getHeaders(),
      data: form
    });
    return response.data;
  }

  async remove(name) {
    const form = new FormData();
    form.append("name", name);
    form.append("token", this.apiToken);
    const response = await axios.request({
      url: urljoin(this.origin, SLACK_EMOJI_REMOVE_API),
      method: "post",
      headers: form.getHeaders(),
      data: form
    });
    return response.data;
  }
}

module.exports = SlackEmojiUploader;
