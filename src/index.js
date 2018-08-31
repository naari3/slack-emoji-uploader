const cheerio = require("cheerio");
const axios = require("axios");
const FormData = require("form-data");

const axiosCookieJarSupport = require("@3846masa/axios-cookiejar-support")
  .default;
const tough = require("tough-cookie");

axiosCookieJarSupport(axios);

class SlackTokenGetter {
  constructor(subdomain) {
    this.subdomain = subdomain;
    this.domain = `${subdomain}.slack.com`;
    this.jar = new tough.CookieJar();
    this.tokenData;
    this.apiToken;
  }

  async token() {
    const response = await axios.get(`https://${this.domain}/?no_sso=1`, {
      jar: this.jar,
      withCredentials: true
    });
    const $ = cheerio.load(response.data);
    this.tokenData = {
      signin: $('#signin_form input[name="signin"]').attr("value"),
      redir: $('#signin_form input[name="redir"]').attr("value"),
      crumb: $('#signin_form input[name="crumb"]').attr("value"),
      remember: "on"
    };
  }

  async login(email, password) {
    const params = new URLSearchParams(
      Object.assign(this.tokenData, { email, password })
    );
    try {
      await axios.request({
        url: `https://${this.domain}/?no_sso=1`,
        method: "post",
        data: params,
        jar: this.jar,
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: status => {
          return status === 302;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async emoji() {
    const response = await axios.get(`https://${this.domain}/admin/emoji`, {
      jar: this.jar,
      withCredentials: true
    });
    this.apiToken = response.data.match(new RegExp('api_token: "(.+?)"'))[1];
  }

  async upload(name, image) {
    const form = new FormData();
    form.append("mode", "data");
    form.append("name", name);
    form.append("image", image, `${name}.png`);
    form.append("token", this.apiToken);
    const response = await axios.request({
      url: `https://${this.domain}/api/emoji.add`,
      method: "post",
      headers: form.getHeaders(),
      data: form,
      jar: this.jar,
      withCredentials: true
    });
    return response.data;
  }
}

module.exports = SlackTokenGetter;
