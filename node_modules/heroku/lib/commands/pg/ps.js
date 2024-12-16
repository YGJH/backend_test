"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const fetcher_1 = require("../../lib/pg/fetcher");
const psql_1 = require("../../lib/pg/psql");
const nls_1 = require("../../nls");
class Ps extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Ps);
        const { database: databaseName } = args;
        const { verbose, app } = flags;
        const db = await (0, fetcher_1.database)(this.heroku, app, databaseName);
        const num = Math.random();
        const waitingMarker = `${num}${num}`;
        const waitingQuery = (0, tsheredoc_1.default)(`
    SELECT '${num}' || '${num}'
    WHERE EXISTS
        (SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'pg_catalog'
           AND TABLE_NAME = 'pg_stat_activity'
           AND COLUMN_NAME = 'waiting')
    `);
        const waitingOutput = await (0, psql_1.exec)(db, waitingQuery);
        const waiting = waitingOutput.includes(waitingMarker) ? 'waiting' : 'wait_event IS NOT NULL AS waiting';
        const query = (0, tsheredoc_1.default)(`SELECT pid,
           state,
           application_name AS SOURCE,
           usename AS username,
           age(now(), xact_start) AS running_for,
           xact_start AS transaction_start, ${waiting}, query
    FROM pg_stat_activity
    WHERE query <> '<insufficient privilege>' ${verbose ? '' : "AND state <> 'idle'"}
      AND pid <> pg_backend_pid()
    ORDER BY query_start DESC
    `);
        const output = await (0, psql_1.exec)(db, query);
        process.stdout.write(output);
    }
}
exports.default = Ps;
Ps.topic = 'pg';
Ps.description = 'view active queries with execution time';
Ps.flags = {
    verbose: command_1.flags.boolean({ char: 'v' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Ps.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
