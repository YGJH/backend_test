"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function push(remote) {
    return `git push ${remote || 'heroku'} main`;
}
exports.default = push;
