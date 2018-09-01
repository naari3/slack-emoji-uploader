import * as axios from "axios";
import * as FormData from "form-data";
import * as urljoin from "url-join";

const SLACK_DOMAIN = "slack.com";
const SLACK_EMOJI_ADD_API = "api/emoji.add";
const SLACK_EMOJI_REMOVE_API = "api/emoji.remove";

export class SlackEmojiUploader {
  subdomain: string;
  origin: string;
  apiToken: string;

  constructor(subdomain: string, apiToken: string) {
    this.subdomain = subdomain;
    this.origin = `https://${subdomain}.${SLACK_DOMAIN}`;
    this.apiToken = apiToken;
  }

  async upload(name: string, image: Blob) {
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

  async alias(name: string, alias_for: string) {
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

  async remove(name: string) {
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
