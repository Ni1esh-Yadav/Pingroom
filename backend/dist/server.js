"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
const report_1 = __importDefault(require("./routes/report"));
const wsSignaling_1 = require("./wsSignaling");
const config_1 = require("./config");
const rateLimiter_1 = require("./utils/rateLimiter");
const logger_1 = require("./logger");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// CORS - allow credentials so cookies/session can be sent from frontend
app.use((0, cors_1.default)({
    origin: config_1.ORIGIN,
    credentials: true,
}));
// Session middleware (NEW) - required for passport session-based auth
app.use((0, express_session_1.default)({
    secret: config_1.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set to true if using HTTPS in production
        sameSite: 'lax',
        domain: undefined, // set if you need a specific cookie domain
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
}));
app.use(rateLimiter_1.createApiLimiter);
app.use('/auth', auth_1.default);
app.use('/reports', report_1.default);
app.get('/health', (req, res) => res.json({ ok: true, env: config_1.NODE_ENV }));
const server = http_1.default.createServer(app);
(0, wsSignaling_1.createSignalingServer)(server);
server.listen(config_1.PORT, () => {
    (0, logger_1.log)(`Server listenin on localhost:${config_1.PORT}`);
});
