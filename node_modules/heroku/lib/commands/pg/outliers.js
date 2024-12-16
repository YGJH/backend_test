"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../lib/pg/fetcher");
const psql_1 = require("../../lib/pg/psql");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../nls");
class Outliers extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Outliers);
        const { app, reset, truncate, num } = flags;
        const db = await (0, fetcher_1.database)(this.heroku, app, args.database);
        const version = await (0, psql_1.fetchVersion)(db);
        await this.ensurePGStatStatement(db);
        if (reset) {
            await (0, psql_1.exec)(db, 'SELECT pg_stat_statements_reset();');
            return;
        }
        let limit = 10;
        if (num) {
            if (/^(\d+)$/.exec(num)) {
                limit = Number.parseInt(num, 10);
            }
            else {
                core_1.ux.error(`Cannot parse num param value "${num}" to a number`);
            }
        }
        const query = this.outliersQuery(version, limit, truncate);
        const output = await (0, psql_1.exec)(db, query);
        core_1.ux.log(output);
    }
    async ensurePGStatStatement(db) {
        const query = (0, tsheredoc_1.default) `
      SELECT exists(
        SELECT 1
        FROM pg_extension e
          LEFT JOIN pg_namespace n ON n.oid = e.extnamespace
        WHERE e.extname = 'pg_stat_statements' AND n.nspname IN ('public', 'heroku_ext')
      ) AS available;
    `;
        const output = await (0, psql_1.exec)(db, query);
        if (!output.includes('t')) {
            core_1.ux.error((0, tsheredoc_1.default) `
        pg_stat_statements extension need to be installed first.
        You can install it by running: CREATE EXTENSION pg_stat_statements WITH SCHEMA heroku_ext;
      `);
        }
    }
    outliersQuery(version, limit, truncate) {
        const truncatedQueryString = truncate ? (0, tsheredoc_1.default) `
      CASE WHEN length(query) <= 40 THEN query ELSE substr(query, 0, 39) || '…' END
    ` : 'query';
        if (version && Number.parseInt(version, 10) >= 13) {
            return (0, tsheredoc_1.default) `
        SELECT
          interval '1 millisecond' * total_exec_time AS total_exec_time,
          to_char((total_exec_time/sum(total_exec_time) OVER()) * 100, 'FM90D0') || '%'  AS prop_exec_time,
          to_char(calls, 'FM999G999G999G990') AS ncalls,
          interval '1 millisecond' * (blk_read_time + blk_write_time) AS sync_io_time,
          ${truncatedQueryString} AS query
        FROM pg_stat_statements
        WHERE userid = (
          SELECT usesysid FROM pg_user WHERE usename = current_user LIMIT 1
        )
        ORDER BY total_exec_time DESC
        LIMIT ${limit};
      `;
        }
        return (0, tsheredoc_1.default) `
      SELECT
        interval '1 millisecond' * total_time AS total_exec_time,
        to_char((total_time/sum(total_time) OVER()) * 100, 'FM90D0') || '%'  AS prop_exec_time,
        to_char(calls, 'FM999G999G999G990') AS ncalls,
        interval '1 millisecond' * (blk_read_time + blk_write_time) AS sync_io_time,
        ${truncatedQueryString} AS query
      FROM pg_stat_statements
      WHERE userid = (
        SELECT usesysid FROM pg_user WHERE usename = current_user LIMIT 1
      )
      ORDER BY total_time DESC
      LIMIT ${limit};
    `;
    }
}
exports.default = Outliers;
Outliers.topic = 'pg';
Outliers.description = 'show 10 queries that have longest execution time in aggregate';
Outliers.flags = {
    reset: command_1.flags.boolean({ description: 'resets statistics gathered by pg_stat_statements' }),
    truncate: command_1.flags.boolean({ char: 't', description: 'truncate queries to 40 characters' }),
    num: command_1.flags.string({ char: 'n', description: 'the number of queries to display (default: 10)' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Outliers.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
