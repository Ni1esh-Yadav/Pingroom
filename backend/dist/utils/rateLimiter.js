"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.createApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1000 * 60, // 1 minute
    max: 60, // per minute
    standardHeaders: true,
    legacyHeaders: false,
});
