"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
const tsheredoc_1 = require("tsheredoc");
class Maintenance extends command_1.Command {
    async run() {
        var _a;
        const { args, flags } = await this.parse(Maintenance);
        const { app: appName, window, run, force } = flags;
        const { database } = args;
        const api = (0, api_1.default)(appName, database, false, this.heroku);
        const addon = await api.getRedisAddon();
        if ((_a = addon.plan.name) === null || _a === void 0 ? void 0 : _a.match(/hobby/)) {
            core_1.ux.error('redis:maintenance is not available for hobby-dev instances', { exit: 1 });
        }
        if (window) {
            if (!window.match(/[A-Za-z]{3,10} \d\d?:[03]0/)) {
                core_1.ux.error('Maintenance windows must be "Day HH:MM", where MM is 00 or 30.', { exit: 1 });
            }
            const { body: maintenance } = await api.request(`/redis/v0/databases/${addon.name}/maintenance_window`, 'PUT', { description: window });
            core_1.ux.log(`Maintenance window for ${addon.name} (${addon.config_vars.join(', ')}) set to ${maintenance.window}.`);
            return;
        }
        if (run) {
            const { body: app } = await this.heroku.get(`/apps/${appName}`);
            if (!app.maintenance && !force) {
                core_1.ux.error('Application must be in maintenance mode or --force flag must be used', { exit: 1 });
            }
            const { body: maintenance } = await api.request(`/redis/v0/databases/${addon.name}/maintenance`, 'POST');
            core_1.ux.log(maintenance.message);
            return;
        }
        const { body: maintenance } = await api.request(`/redis/v0/databases/${addon.name}/maintenance`, 'GET');
        core_1.ux.log(maintenance.message);
    }
}
exports.default = Maintenance;
Maintenance.topic = 'redis';
Maintenance.description = (0, tsheredoc_1.default) `
    manage maintenance windows
    Set or change the maintenance window for your Redis instance
  `;
Maintenance.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    window: command_1.flags.string({
        char: 'w',
        description: 'set weekly UTC maintenance window (format: "Day HH:MM", where MM is 00 or 30)',
        hasValue: true,
        required: false,
    }),
    run: command_1.flags.boolean({ description: 'start maintenance', required: false }),
    force: command_1.flags.boolean({
        char: 'f',
        description: 'start maintenance without entering application maintenance mode',
        required: false,
    }),
};
Maintenance.args = {
    database: core_1.Args.string({ required: false, description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
