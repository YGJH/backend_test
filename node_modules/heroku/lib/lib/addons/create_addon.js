"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const util = require("./util");
const addons_wait_1 = require("./addons_wait");
function formatConfigVarsMessage(addon) {
    const configVars = addon.config_vars || [];
    if (configVars.length > 0) {
        return `Created ${color_1.default.addon(addon.name || '')} as ${configVars.map((c) => color_1.default.configVar(c)).join(', ')}`;
    }
    return `Created ${color_1.default.addon(addon.name || '')}`;
}
// eslint-disable-next-line max-params
async function default_1(heroku, app, plan, confirm, wait, options) {
    async function createAddonRequest(confirmed) {
        var _a;
        const body = {
            confirm: confirmed,
            name: options.name,
            config: options.config,
            plan: { name: plan },
            attachment: { name: options.as },
        };
        core_1.ux.action.start(`Creating ${plan} on ${color_1.default.app(app)}`);
        const { body: addon } = await heroku.post(`/apps/${app}/addons`, {
            body,
            headers: {
                'accept-expansion': 'plan',
                'x-heroku-legacy-provider-messages': 'true',
            },
        });
        core_1.ux.action.stop(color_1.default.green(util.formatPriceText(((_a = addon.plan) === null || _a === void 0 ? void 0 : _a.price) || '')));
        return addon;
    }
    let addon = await util.trapConfirmationRequired(app, confirm, confirm => (createAddonRequest(confirm)));
    if (addon.provision_message) {
        core_1.ux.log(addon.provision_message);
    }
    if (addon.state === 'provisioning') {
        if (wait) {
            core_1.ux.log(`Waiting for ${color_1.default.addon(addon.name || '')}...`);
            addon = await (0, addons_wait_1.waitForAddonProvisioning)(heroku, addon, 5);
            core_1.ux.log(formatConfigVarsMessage(addon));
        }
        else {
            core_1.ux.log(`${color_1.default.addon(addon.name || '')} is being created in the background. The app will restart when complete...`);
            core_1.ux.log(`Use ${color_1.default.cmd('heroku addons:info ' + addon.name)} to check creation progress`);
        }
    }
    else if (addon.state === 'deprovisioned') {
        throw new Error(`The add-on was unable to be created, with status ${addon.state}`);
    }
    else {
        core_1.ux.log(formatConfigVarsMessage(addon));
    }
    return addon;
}
exports.default = default_1;
