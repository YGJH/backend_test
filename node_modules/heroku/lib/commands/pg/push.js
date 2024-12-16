"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const fetcher_1 = require("../../lib/pg/fetcher");
const util_1 = require("../../lib/pg/util");
const push_pull_1 = require("../../lib/pg/push_pull");
const node_child_process_1 = require("node:child_process");
const nls_1 = require("../../nls");
const env = process.env;
class Push extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Push);
        const { app, 'exclude-table-data': excludeTableData } = flags;
        const exclusions = (0, push_pull_1.parseExclusions)(excludeTableData);
        const source = (0, util_1.parsePostgresConnectionString)(args.source);
        const target = await (0, fetcher_1.database)(this.heroku, app, args.target);
        core_1.ux.log(`Pushing ${color_1.default.cyan(args.source)} to ${color_1.default.addon(target.attachment.addon.name)}`);
        await this.push(source, target, exclusions);
        core_1.ux.log('Pushing complete.');
    }
    async push(sourceIn, targetIn, exclusions) {
        await (0, push_pull_1.prepare)(targetIn);
        const source = await (0, push_pull_1.maybeTunnel)(sourceIn);
        const target = await (0, push_pull_1.maybeTunnel)(targetIn);
        const exclude = exclusions.map(function (e) {
            return '--exclude-table-data=' + e;
        }).join(' ');
        const dumpFlags = ['--verbose', '-F', 'c', '-Z', '0', '-N', '_heroku', ...(0, push_pull_1.connArgs)(source, true)];
        if (exclude !== '')
            dumpFlags.push(exclude);
        const dumpOptions = {
            env: Object.assign({ PGSSLMODE: 'prefer' }, env),
            stdio: ['pipe', 'pipe', 2],
            shell: true,
        };
        if (source.password)
            dumpOptions.env.PGPASSWORD = source.password;
        const restoreFlags = ['--verbose', '-F', 'c', '--no-acl', '--no-owner', ...(0, push_pull_1.connArgs)(target)];
        const restoreOptions = {
            env: Object.assign({}, env),
            stdio: ['pipe', 'pipe', 2],
            shell: true,
        };
        if (target.password)
            restoreOptions.env.PGPASSWORD = target.password;
        const pgDump = (0, node_child_process_1.spawn)('pg_dump', dumpFlags, dumpOptions);
        const pgRestore = (0, node_child_process_1.spawn)('pg_restore', restoreFlags, restoreOptions);
        await (0, push_pull_1.spawnPipe)(pgDump, pgRestore);
        if (source._tunnel)
            source._tunnel.close();
        if (target._tunnel)
            target._tunnel.close();
        await (0, push_pull_1.verifyExtensionsMatch)(sourceIn, targetIn);
    }
}
exports.default = Push;
Push.topic = 'pg';
Push.description = (0, tsheredoc_1.default) `
    push local or remote into Heroku database
    Push from SOURCE into TARGET. TARGET must be empty.

    To empty a Heroku database for push run ${color_1.default.cmd('heroku pg:reset')}

    SOURCE must be either the name of a database existing on your localhost or the
    fully qualified URL of a remote database.
  `;
Push.examples = [(0, tsheredoc_1.default) `
      # push mylocaldb into a Heroku DB named postgresql-swimmingly-100
      $ heroku pg:push mylocaldb postgresql-swimmingly-100 --app sushi
    `, (0, tsheredoc_1.default) `
      # push remote DB at postgres://myhost/mydb into a Heroku DB named postgresql-swimmingly-100
      $ heroku pg:push postgres://myhost/mydb postgresql-swimmingly-100 --app sushi
  `];
Push.flags = {
    'exclude-table-data': command_1.flags.string({ description: 'tables for which data should be excluded (use \';\' to split multiple names)', hasValue: true }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Push.args = {
    source: core_1.Args.string({ required: true, description: 'PostgreSQL connection string for the source database' }),
    target: core_1.Args.string({ required: true, description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
