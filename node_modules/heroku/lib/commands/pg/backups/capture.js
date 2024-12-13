"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const backups_1 = require("../../../lib/pg/backups");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../../nls");
class Capture extends command_1.Command {
    async run() {
        var _a;
        const { flags, args } = await this.parse(Capture);
        const { app, 'wait-interval': waitInterval, verbose } = flags;
        const { database } = args;
        const interval = Math.max(3, Number.parseInt(waitInterval || '3', 10));
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        const pgBackupsApi = (0, backups_1.default)(app, this.heroku);
        try {
            const { body: dbInfo } = await this.heroku.get(`/client/v11/databases/${db.id}`, { hostname: (0, host_1.default)() });
            const dbProtected = /On/.test(((_a = dbInfo.info.find(attribute => attribute.name === 'Continuous Protection')) === null || _a === void 0 ? void 0 : _a.values[0]) || '');
            if (dbProtected) {
                core_1.ux.warn('Continuous protection is already enabled for this database. Logical backups of large databases are likely to fail.');
                core_1.ux.warn('See https://devcenter.heroku.com/articles/heroku-postgres-data-safety-and-continuous-protection#physical-backups-on-heroku-postgres.');
            }
        }
        catch (error) {
            const httpError = error;
            if (httpError.statusCode !== 404)
                throw httpError;
            core_1.ux.error((0, tsheredoc_1.default) `
          ${color_1.default.yellow(db.name)} is not yet provisioned.
          Run ${color_1.default.cmd('heroku addons:wait')} to wait until the db is provisioned.
        `, { exit: 1 });
        }
        core_1.ux.action.start(`Starting backup of ${color_1.default.yellow(db.name)}`);
        const { body: backup } = await this.heroku.post(`/client/v11/databases/${db.id}/backups`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
        core_1.ux.log((0, tsheredoc_1.default) `

      Use Ctrl-C at any time to stop monitoring progress; the backup will continue running.
      Use ${color_1.default.cmd('heroku pg:backups:info')} to check progress.
      Stop a running backup with ${color_1.default.cmd('heroku pg:backups:cancel')}.
    `);
        if (app !== db.app.name) {
            core_1.ux.log((0, tsheredoc_1.default) `
        HINT: You are running this command with a non-billing application.
        Use ${color_1.default.cmd('heroku pg:backups -a ' + db.app.name)} to check the list of backups.
      `);
        }
        await pgBackupsApi.wait(`Backing up ${color_1.default.green(backup.from_name)} to ${color_1.default.cyan(pgBackupsApi.name(backup))}`, backup.uuid, interval, verbose, db.app.name || app);
    }
}
exports.default = Capture;
Capture.topic = 'pg';
Capture.description = 'capture a new backup';
Capture.flags = {
    'wait-interval': command_1.flags.string(),
    verbose: command_1.flags.boolean({ char: 'v' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Capture.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
