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
class Pull extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Pull);
        const { app, 'exclude-table-data': excludeTableData } = flags;
        const exclusions = (0, push_pull_1.parseExclusions)(excludeTableData);
        const source = await (0, fetcher_1.database)(this.heroku, app, args.source);
        const target = (0, util_1.parsePostgresConnectionString)(args.target);
        core_1.ux.log(`Pulling ${color_1.default.cyan(source.attachment.addon.name)} to ${color_1.default.addon(args.target)}`);
        await this.pull(source, target, exclusions);
        core_1.ux.log('Pulling complete.');
    }
    async pull(sourceIn, targetIn, exclusions) {
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
exports.default = Pull;
Pull.topic = 'pg';
Pull.description = (0, tsheredoc_1.default) `
    pull Heroku database into local or remote database
    Pull from SOURCE into TARGET.

    TARGET must be one of:
    * a database name (i.e. on a local PostgreSQL server)  => TARGET must not exist and will be created
    * a fully qualified URL to a local PostgreSQL server   => TARGET must not exist and will be created
    * a fully qualified URL to a remote PostgreSQL server  => TARGET must exist and be empty

    To delete a local database run ${color_1.default.cmd('dropdb TARGET')}.
    To create an empty remote database, run ${color_1.default.cmd('createdb')} with connection command-line options (run ${color_1.default.cmd('createdb --help')} for details).
  `;
Pull.examples = [(0, tsheredoc_1.default) `
    # pull Heroku DB named postgresql-swimmingly-100 into local DB mylocaldb that must not exist
    $ heroku pg:pull postgresql-swimmingly-100 mylocaldb --app sushi
  `, (0, tsheredoc_1.default) `
    # pull Heroku DB named postgresql-swimmingly-100 into empty remote DB at postgres://myhost/mydb
    $ heroku pg:pull postgresql-swimmingly-100 postgres://myhost/mydb --app sushi
  `];
Pull.flags = {
    'exclude-table-data': command_1.flags.string({ description: 'tables for which data should be excluded (use \';\' to split multiple names)', hasValue: true }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Pull.args = {
    source: core_1.Args.string({ required: true, description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    target: core_1.Args.string({ required: true, description: 'PostgreSQL connection string for the target database' }),
};
