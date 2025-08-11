"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blocklist_1 = require("../models/blocklist");
const ensureAuth_1 = require("../middleware/ensureAuth");
const router = express_1.default.Router();
// allow authenticated users to report other users or IPs
router.post('/report', ensureAuth_1.ensureAuth, (req, res) => {
    const { targetKey, block } = req.body;
    if (!targetKey)
        return res.status(400).json({ error: 'targetKey required' });
    const count = (0, blocklist_1.report)(targetKey);
    if (block && count > 5) {
        (0, blocklist_1.addBlock)({
            reason: 'reported repeatedly',
            ip: targetKey,
            createdAt: new Date().getTime()
        });
    }
    res.json({ ok: true, count });
});
exports.default = router;
