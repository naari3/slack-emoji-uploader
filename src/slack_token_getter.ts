import * as cheerio from "cheerio";
import axios from "axios";
// import * as URLSearchParams from "url-search-params";
import URLSearchParams = require("url-search-params");

import * as urljoin from "url-join";

import axiosCookieJarSupport from "@3846masa/axios-cookiejar-support";
import * as tough from "tough-cookie";

axiosCookieJarSupport(axios);

const SLACK_DOMAIN = "slack.com";
const SLACK_LOGIN_FORM = "?no_sso=1";
const SLACK_EMOJI_LIST = "admin/emoji";

interface tokenData {
  signin: string;
  redir: string;
  crumb: string;
  remember: string;
}

export class SlackTokenGetter {
  subdomain: string;
  origin: string;
  jar: tough.CookieJar;
  tokenData: tokenData;
  apiToken: string;

  constructor(subdomain: string) {
    this.subdomain = subdomain;
    this.origin = `https://${subdomain}.${SLACK_DOMAIN}`;
    this.jar = new tough.CookieJar();
    this.tokenData;
    this.apiToken;
  }

  async getApiToken(email: string, password: string) {
    await this.getCrumb();
    await this.login(email, password);
    await this.generateApiToken();
    return this.apiToken;
  }

  async getCrumb() {
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
    return this.tokenData;
  }

  async login(email: string, password: string) {
    const params = new URLSearchParams({ email, password, ...this.tokenData });
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
    return "ok";
  }

  async generateApiToken() {
    const response = await axios.get(urljoin(this.origin, SLACK_EMOJI_LIST), {
      jar: this.jar,
      withCredentials: true
    });
    this.apiToken = response.data.match(new RegExp('api_token: "(.+?)"'))[1];
    return this.apiToken;
  }
}
