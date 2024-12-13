"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remaining = exports.ago = void 0;
const strftime = require("strftime");
function ago(since) {
    const elapsed = Math.floor((Date.now() - since.getTime()) / 1000);
    const message = strftime('%Y/%m/%d %H:%M:%S %z', since);
    if (elapsed < 60)
        return `${message} (~ ${Math.floor(elapsed)}s ago)`;
    if (elapsed < 60 * 60)
        return `${message} (~ ${Math.floor(elapsed / 60)}m ago)`;
    if (elapsed < 60 * 60 * 25)
        return `${message} (~ ${Math.floor(elapsed / 60 / 60)}h ago)`;
    return message;
}
exports.ago = ago;
function remaining(from, to) {
    const secs = Math.floor((to / 1000) - (from / 1000));
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0)
        return `${hours}h ${mins % 60}m`;
    if (mins > 0)
        return `${mins}m ${secs % 60}s`;
    if (secs > 0)
        return `${secs}s`;
    return '';
}
exports.remaining = remaining;
