"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
function log(...args) {
    if (process.env.NODE_ENV !== 'test')
        console.log(new Date().toISOString(), ...args);
}
