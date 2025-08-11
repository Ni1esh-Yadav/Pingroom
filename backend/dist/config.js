"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_CALLBACK_URL = exports.GITHUB_CLIENT_SECRET = exports.GITHUB_CLIENT_ID = exports.JWT_SECRET = exports.COOKIE_DOMAIN = exports.SESSION_SECRET = exports.ORIGIN = exports.NODE_ENV = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = Number(process.env.PORT || 3000);
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.ORIGIN = process.env.ORIGIN || 'http://localhost:3000';
exports.SESSION_SECRET = process.env.SESSION_SECRET || 'replace-session-secret';
exports.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';
exports.JWT_SECRET = process.env.JWT_SECRET || 'replace-me';
exports.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
exports.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
exports.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback';
