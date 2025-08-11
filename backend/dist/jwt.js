"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUser = signUser;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function signUser(user) {
    return jsonwebtoken_1.default.sign(user, config_1.JWT_SECRET, { expiresIn: '7d' });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
    }
    catch (e) {
        return null;
    }
}
