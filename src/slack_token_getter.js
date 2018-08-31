const cheerio = require("cheerio");
const axios = require("axios");
const FormData = require("form-data");

const urljoin = require("url-join");

const axiosCookieJarSupport = require("@3846masa/axios-cookiejar-support")
  .default;
const tough = require("tough-cookie");

axiosCookieJarSupport(axios);

const SLACK_DOMAIN = "slack.com";
const SLACK_LOGIN_FORM = "?no_sso=1";
const SLACK_EMOJI_LIST = "admin/emoji";

class SlackTokenGetter {
  constructor(subdomain) {
    this.subdomain = subdomain;
    this.origin = `https://${subdomain}.${SLACK_DOMAIN}`;
    this.jar = new tough.CookieJar();
    this.tokenData;
    this.apiToken = apiToken;
  }

  async getApiToken(email, password) {
    await this.token();
    await this.login(email, password);
    await this.emoji();
    return this.apiToken;
  }

  async token() {
    const response = await axios.get(urljoin(this.origin, SLACK_LOGIN_FORM), {
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
        url: urljoin(this.origin, SLACK_LOGIN_FORM),
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
    const response = await axios.get(urljoin(this.origin, SLACK_EMOJI_LIST), {
      jar: this.jar,
      withCredentials: true
    });
    this.apiToken = response.data.match(new RegExp('api_token: "(.+?)"'))[1];
  }
}

module.exports = SlackTokenGetter;
