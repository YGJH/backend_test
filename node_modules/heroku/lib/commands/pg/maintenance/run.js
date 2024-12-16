"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../../lib/pg/fetcher");
const util_1 = require("../../../lib/pg/util");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
class Run extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Run);
        const { app, force } = flags;
        const { database } = args;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        if ((0, util_1.essentialPlan)(db))
            core_1.ux.error("pg:maintenance isn't available for Essential-tier databases.");
        core_1.ux.action.start(`Starting maintenance for ${color_1.default.yellow(db.name)}`);
        if (!force) {
            const { body: appInfo } = await this.heroku.get(`/apps/${app}`);
            if (!appInfo.maintenance)
                core_1.ux.error('Application must be in maintenance mode or run with --force');
        }
        const { body: response } = await this.heroku.post(`/client/v11/databases/${db.id}/maintenance`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop(response.message || 'done');
    }
}
exports.default = Run;
Run.topic = 'pg';
Run.description = 'start maintenance';
Run.flags = {
    force: command_1.flags.boolean({ char: 'f' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Run.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
