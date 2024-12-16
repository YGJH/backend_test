"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    const host = process.env.HEROKU_DATA_HOST || process.env.HEROKU_POSTGRESQL_HOST;
    return host ? host : 'api.data.heroku.com';
}
exports.default = default_1;
