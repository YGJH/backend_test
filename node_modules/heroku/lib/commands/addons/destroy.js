"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const notify_1 = require("../../lib/notify");
const confirmCommand_1 = require("../../lib/confirmCommand");
const destroy_addon_1 = require("../../lib/addons/destroy_addon");
const resolve_1 = require("../../lib/addons/resolve");
const lodash_1 = require("lodash");
class Destroy extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags, argv } = await this.parse(Destroy);
        const { app, wait, confirm } = flags;
        const force = flags.force || process.env.HEROKU_FORCE === '1';
        const addons = await Promise.all(argv.map(name => (0, resolve_1.resolveAddon)(this.heroku, app, name)));
        for (const addon of addons) {
            // prevent deletion of add-on when context.app is set but the addon is attached to a different app
            const addonApp = (_a = addon.app) === null || _a === void 0 ? void 0 : _a.name;
            if (app && addonApp !== app) {
                throw new Error(`${color_1.default.yellow((_b = addon.name) !== null && _b !== void 0 ? _b : '')} is on ${color_1.default.magenta(addonApp !== null && addonApp !== void 0 ? addonApp : '')} not ${color_1.default.magenta(app)}`);
            }
        }
        for (const addonApps of Object.entries((0, lodash_1.groupBy)(addons, 'app.name'))) {
            const currentAddons = addonApps[1];
            const appName = addonApps[0];
            await (0, confirmCommand_1.default)(appName, confirm);
            for (const addon of currentAddons) {
                try {
                    await (0, destroy_addon_1.default)(this.heroku, addon, force, wait);
                    if (wait) {
                        (0, notify_1.default)(`heroku addons:destroy ${addon.name}`, 'Add-on successfully deprovisioned');
                    }
                }
                catch (error) {
                    if (wait) {
                        (0, notify_1.default)(`heroku addons:destroy ${addon.name}`, 'Add-on failed to deprovision', false);
                    }
                    throw error;
                }
            }
        }
    }
}
exports.default = Destroy;
Destroy.topic = 'addons';
Destroy.description = 'permanently destroy an add-on resource';
Destroy.strict = false;
Destroy.examples = ['addons:destroy [ADDON]... [flags]'];
Destroy.hiddenAliases = ['addons:remove'];
Destroy.flags = {
    force: command_1.flags.boolean({ char: 'f', description: 'allow destruction even if connected to other apps' }),
    confirm: command_1.flags.string({ char: 'c' }),
    wait: command_1.flags.boolean({ description: 'watch add-on destruction status and exit when complete' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Destroy.args = {
    addonName: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
};
