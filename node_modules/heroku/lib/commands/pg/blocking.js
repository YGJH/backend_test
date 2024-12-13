"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const fetcher_1 = require("../../lib/pg/fetcher");
const psql_1 = require("../../lib/pg/psql");
const nls_1 = require("../../nls");
class Blocking extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Blocking);
        const { app } = flags;
        const query = (0, tsheredoc_1.default) `
        SELECT bl.pid AS blocked_pid,
          ka.query AS blocking_statement,
          now() - ka.query_start AS blocking_duration,
          kl.pid AS blocking_pid,
          a.query AS blocked_statement,
          now() - a.query_start AS blocked_duration
        FROM pg_catalog.pg_locks bl
        JOIN pg_catalog.pg_stat_activity a
          ON bl.pid = a.pid
        JOIN pg_catalog.pg_locks kl
          JOIN pg_catalog.pg_stat_activity ka
            ON kl.pid = ka.pid
        ON bl.transactionid = kl.transactionid AND bl.pid != kl.pid
        WHERE NOT bl.granted
      `;
        const db = await (0, fetcher_1.database)(this.heroku, app, args.database);
        const output = await (0, psql_1.exec)(db, query);
        core_1.ux.log(output);
    }
}
exports.default = Blocking;
Blocking.topic = 'pg';
Blocking.description = 'display queries holding locks other queries are waiting to be released';
Blocking.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Blocking.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
