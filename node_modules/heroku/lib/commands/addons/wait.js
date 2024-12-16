"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const resolve_1 = require("../../lib/addons/resolve");
const addons_wait_1 = require("../../lib/addons/addons_wait");
const notify_1 = require("../../lib/notify");
class Wait extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Wait);
        let addonsToWaitFor;
        if (args.addon) {
            addonsToWaitFor = [await (0, resolve_1.resolveAddon)(this.heroku, flags.app, args.addon)];
        }
        else if (flags.app) {
            const { body: addons } = await this.heroku.get(`/apps/${flags.app}/addons`);
            addonsToWaitFor = addons;
        }
        else {
            const { body: addons } = await this.heroku.get('/addons');
            addonsToWaitFor = addons;
        }
        addonsToWaitFor = addonsToWaitFor.filter((addon) => addon.state === 'provisioning' || addon.state === 'deprovisioning');
        let interval = Number.parseInt(flags['wait-interval'] || '', 10);
        if (!interval || interval < 0) {
            interval = 5;
        }
        for (const addon of addonsToWaitFor) {
            const startTime = new Date();
            const addonName = addon.name || '';
            if (addon.state === 'provisioning') {
                let addonResponse;
                try {
                    addonResponse = await (0, addons_wait_1.waitForAddonProvisioning)(this.heroku, addon, interval);
                }
                catch (error) {
                    (0, notify_1.default)(`heroku addons:wait ${addonName}`, 'Add-on failed to provision', false);
                    throw error;
                }
                const configVars = (addonResponse.config_vars || []);
                if (configVars.length > 0) {
                    const decoratedConfigVars = configVars.map(c => color_1.default.green(c))
                        .join(', ');
                    core_1.ux.log(`Created ${color_1.default.yellow(addonName)} as ${decoratedConfigVars}`);
                }
                if (Date.now() - startTime.valueOf() >= 1000 * 5) {
                    (0, notify_1.default)(`heroku addons:wait ${addonName}`, 'Add-on successfully provisioned');
                }
            }
            else if (addon.state === 'deprovisioning') {
                await (0, addons_wait_1.waitForAddonDeprovisioning)(this.heroku, addon, interval);
                if (Date.now() - startTime.valueOf() >= 1000 * 5) {
                    (0, notify_1.default)(`heroku addons:wait ${addonName}`, 'Add-on successfully deprovisioned');
                }
            }
        }
    }
}
exports.default = Wait;
Wait.topic = 'addons';
Wait.description = 'show provisioning status of the add-ons on the app';
Wait.flags = {
    'wait-interval': command_1.flags.string({ description: 'how frequently to poll in seconds' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Wait.args = {
    addon: core_1.Args.string({ description: 'unique identifier or globally unique name of the add-on' }),
};
