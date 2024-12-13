"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const util_1 = require("../../../lib/pg/util");
const fetcher_1 = require("../../../lib/pg/fetcher");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../../nls");
class Window extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Window);
        const { database, window } = args;
        const { app } = flags;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        if ((0, util_1.essentialPlan)(db))
            core_1.ux.error("pg:maintenance isn't available for Essential-tier databases.");
        if (!window.match(/^[A-Za-z]{2,10} \d\d?:[03]0$/))
            core_1.ux.error('Window must be "Day HH:MM" where MM is 00 or 30');
        core_1.ux.action.start(`Setting maintenance window for ${color_1.default.yellow(db.name)} to ${color_1.default.cyan(window)}`);
        const { body: response } = await this.heroku.put(`/client/v11/databases/${db.id}/maintenance_window`, {
            body: { description: window }, hostname: (0, host_1.default)(),
        });
        core_1.ux.action.stop(response.message || 'done');
    }
}
exports.default = Window;
Window.topic = 'pg';
Window.description = (0, tsheredoc_1.default)(`
    Set weekly maintenance window.
    All times are in UTC.
  `);
Window.example = '$ heroku pg:maintenance:window "Sunday 06:00" postgres-slippery-100';
Window.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Window.args = {
    window: core_1.Args.string({ required: true, description: 'timestamp of the maintenance window' }),
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
