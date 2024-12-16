"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../lib/pg/fetcher");
const psql_1 = require("../../lib/pg/psql");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../nls");
class Locks extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Locks);
        const { app, truncate } = flags;
        const db = await (0, fetcher_1.database)(this.heroku, app, args.database);
        const query = (0, tsheredoc_1.default) `
      SELECT
        pg_stat_activity.pid,
        pg_class.relname,
        pg_locks.transactionid,
        pg_locks.granted,
        ${this.truncatedQueryString(truncate)} AS query_snippet,
        age(now(), pg_stat_activity.query_start) AS "age"
      FROM
        pg_stat_activity,
        pg_locks
          LEFT OUTER JOIN pg_class
          ON pg_locks.relation = pg_class.oid
      WHERE
        pg_stat_activity.query <> '<insufficient privilege>'
        AND pg_locks.pid = pg_stat_activity.pid
        AND pg_locks.mode = 'ExclusiveLock'
        AND pg_stat_activity.pid <> pg_backend_pid() order by query_start;
    `;
        const output = await (0, psql_1.exec)(db, query);
        core_1.ux.log(output);
    }
    truncatedQueryString(truncate) {
        const column = 'pg_stat_activity.query';
        if (truncate) {
            return `CASE WHEN length(${column}) <= 40 THEN ${column} ELSE substr(${column}, 0, 39) || '…' END`;
        }
        return column;
    }
}
exports.default = Locks;
Locks.topic = 'pg';
Locks.description = 'display queries with active locks';
Locks.flags = {
    truncate: command_1.flags.boolean({ char: 't', description: 'truncates queries to 40 characters' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Locks.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
