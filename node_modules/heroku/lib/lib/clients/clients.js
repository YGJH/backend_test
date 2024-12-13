'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateURL = void 0;
const url_1 = require("url");
function insecureURL(uri) {
    if (uri.protocol === 'https:')
        return false;
    // allow non-https localhost, 10.*, 127.*, and 192.* clients for testing
    if (/^localhost(?:[:]\d+)?$/.test(uri.host))
        return false;
    if (/\.local(?:[:]\d+)?$/.test(uri.host))
        return false;
    if (uri.host.match(/^(10|127|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:[:]\d+)?$/))
        return false;
    return true;
}
function validateURL(uri) {
    const u = new url_1.URL(uri);
    if (!u.protocol)
        throw new Error('Invalid URL');
    if (insecureURL(u))
        throw new Error('Unsupported callback URL. Clients have to use HTTPS for non-local addresses.');
    return uri;
}
exports.validateURL = validateURL;
