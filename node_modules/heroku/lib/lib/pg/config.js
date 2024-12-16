"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const responseByAppId = new Map();
async function getConfig(heroku, app) {
    if (!responseByAppId.has(app)) {
        const promise = heroku.get(`/apps/${app}/config-vars`);
        responseByAppId.set(app, promise);
    }
    const result = await responseByAppId.get(app);
    return result === null || result === void 0 ? void 0 : result.body;
}
exports.getConfig = getConfig;
