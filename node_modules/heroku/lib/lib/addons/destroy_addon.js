"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addons_wait_1 = require("./addons_wait");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
async function default_1(heroku, addon, force = false, wait = false) {
    const addonName = addon.name || '';
    async function destroyAddonRequest() {
        var _a, _b;
        core_1.ux.action.start(`Destroying ${color_1.default.addon(addonName)} on ${color_1.default.app(((_a = addon.app) === null || _a === void 0 ? void 0 : _a.name) || '')}`);
        const { body: addonDelete } = await heroku.delete(`/apps/${(_b = addon.app) === null || _b === void 0 ? void 0 : _b.id}/addons/${addon.id}`, {
            headers: { 'Accept-Expansion': 'plan' },
            body: { force },
        }).catch(error => {
            if (error.body && error.body.message) {
                throw new Error(`The add-on was unable to be destroyed: ${error.body.message}.`);
            }
            else {
                throw new Error(`The add-on was unable to be destroyed: ${error}.`);
            }
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (addonDelete.state === 'deprovisioning') {
            core_1.ux.action.stop(color_1.default.yellow('pending'));
        }
        core_1.ux.action.stop();
        return addonDelete;
    }
    let addonResponse = await destroyAddonRequest();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (addonResponse.state === 'deprovisioning') {
        if (wait) {
            core_1.ux.log(`Waiting for ${color_1.default.addon(addonName)}...`);
            addonResponse = await (0, addons_wait_1.waitForAddonDeprovisioning)(heroku, addonResponse, 5);
        }
        else {
            core_1.ux.log(`${color_1.default.addon(addonName)} is being destroyed in the background. The app will restart when complete...`);
            core_1.ux.log(`Use ${color_1.default.cmd('heroku addons:info ' + addonName)} to check destruction progress`);
        }
    }
    else if (addonResponse.state !== 'deprovisioned') {
        throw new Error(`The add-on was unable to be destroyed, with status ${addonResponse.state}.`);
    }
    return addonResponse;
}
exports.default = default_1;
