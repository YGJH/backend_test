"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForAddonDeprovisioning = exports.waitForAddonProvisioning = void 0;
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const waitForAddonProvisioning = async function (api, addon, interval) {
    var _a;
    const app = ((_a = addon.app) === null || _a === void 0 ? void 0 : _a.name) || '';
    const addonName = addon.name;
    let addonBody = Object.assign({}, addon);
    core_1.ux.action.start(`Creating ${color_1.default.addon(addonName || '')}`);
    while (addonBody.state === 'provisioning') {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        const addonResponse = await api.get(`/apps/${app}/addons/${addonName}`, {
            headers: { 'Accept-Expansion': 'addon_service,plan' },
        });
        addonBody = addonResponse === null || addonResponse === void 0 ? void 0 : addonResponse.body;
    }
    if (addonBody.state === 'deprovisioned') {
        throw new Error(`The add-on was unable to be created, with status ${addonBody.state}`);
    }
    core_1.ux.action.stop();
    return addonBody;
};
exports.waitForAddonProvisioning = waitForAddonProvisioning;
const waitForAddonDeprovisioning = async function (api, addon, interval) {
    var _a;
    const app = ((_a = addon.app) === null || _a === void 0 ? void 0 : _a.name) || '';
    const addonName = addon.name || '';
    let addonResponse = Object.assign({}, addon);
    core_1.ux.action.start(`Destroying ${color_1.default.addon(addonName)}`);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    while (addonResponse.state === 'deprovisioning') {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        await api.get(`/apps/${app}/addons/${addonName}`, {
            headers: { 'Accept-Expansion': 'addon_service,plan' },
        }).then(response => {
            addonResponse = response === null || response === void 0 ? void 0 : response.body;
        }).catch(function (error) {
            var _a;
            // Not ideal, but API deletes the record returning a 404 when deprovisioned.
            if (error.statusCode === 404 || ((_a = error.http) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
                addonResponse.state = 'deprovisioned';
            }
            else {
                throw error;
            }
        });
    }
    core_1.ux.action.stop();
    return addonResponse;
};
exports.waitForAddonDeprovisioning = waitForAddonDeprovisioning;
