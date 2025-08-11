"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBlock = addBlock;
exports.isBlocked = isBlocked;
exports.report = report;
const blocks = [];
const reports = [];
function addBlock(entry) {
    blocks.push({ ...entry, createdAt: Date.now() });
}
function isBlocked({ userId, ip }) {
    return blocks.some(b => (userId && b.userId === userId) || (ip && b.ip === ip));
}
function report(key) {
    const found = reports.find(r => r.key === key);
    if (found)
        found.count++;
    else
        reports.push({ key, count: 1 });
    return reports.find(r => r.key === key)?.count ?? 0;
}
