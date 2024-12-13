"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCedarApp = exports.isFirApp = void 0;
async function getApp(appOrName, herokuApi) {
    if (typeof appOrName === 'string') {
        if (herokuApi === undefined)
            throw new Error('herokuApi parameter is required when passing an app name');
        const { body: app } = await herokuApi.get(`/apps/${appOrName}`, {
            headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
        });
        return app;
    }
    return appOrName;
}
async function isFirApp(appOrName, herokuApi) {
    const app = await getApp(appOrName, herokuApi);
    return app.generation === 'fir';
}
exports.isFirApp = isFirApp;
async function isCedarApp(appOrName, herokuApi) {
    const app = await getApp(appOrName, herokuApi);
    return app.generation === 'cedar';
}
exports.isCedarApp = isCedarApp;
