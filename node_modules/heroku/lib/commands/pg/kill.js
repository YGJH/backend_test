"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../lib/pg/fetcher");
const psql_1 = require("../../lib/pg/psql");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../nls");
class Kill extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Kill);
        const { app, force } = flags;
        const { pid } = args;
        const db = await (0, fetcher_1.database)(this.heroku, app, args.database);
        const query = (0, tsheredoc_1.default) `
      SELECT ${force ? 'pg_terminate_backend' : 'pg_cancel_backend'}(${Number.parseInt(pid, 10)});
    `;
        const output = await (0, psql_1.exec)(db, query);
        core_1.ux.log(output);
    }
}
exports.default = Kill;
Kill.topic = 'pg';
Kill.description = 'kill a query';
Kill.flags = {
    force: command_1.flags.boolean({ char: 'f' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Kill.args = {
    pid: core_1.Args.string({ required: true, description: 'ID of the process' }),
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
