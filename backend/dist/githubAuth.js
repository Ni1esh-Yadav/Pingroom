"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeCodeForToken = exchangeCodeForToken;
exports.fetchGithubUser = fetchGithubUser;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
async function exchangeCodeForToken(code) {
    const res = await axios_1.default.post('https://github.com/login/oauth/access_token', {
        client_id: config_1.GITHUB_CLIENT_ID,
        client_secret: config_1.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: config_1.GITHUB_CALLBACK_URL,
    }, { headers: { Accept: 'application/json' } });
    return res.data.access_token;
}
async function fetchGithubUser(accessToken) {
    const res = await axios_1.default.get('https://api.github.com/user', {
        headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github+json' },
    });
    return res.data;
}
