"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuth = ensureAuth;
function ensureAuth(req, res, next) {
    // If you prefer JWT, this middleware would instead validate the Authorization header.
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'Not authenticated' });
}
