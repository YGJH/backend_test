"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../lib/pg/fetcher");
const host_1 = require("../../lib/pg/host");
const nls_1 = require("../../nls");
class Killall extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Killall);
        const { app } = flags;
        core_1.ux.action.start('Terminating connections for all credentials');
        const database = await (0, fetcher_1.getAddon)(this.heroku, app, args.database);
        await this.heroku.post(`/client/v11/databases/${database.id}/connection_reset`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
    }
}
exports.default = Killall;
Killall.topic = 'pg';
Killall.description = 'terminates all connections for all credentials';
Killall.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Killall.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
