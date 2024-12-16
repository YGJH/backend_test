"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const backups_1 = require("../../../lib/pg/backups");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
function dropboxURL(url) {
    if (url.match(/^https?:\/\/www\.dropbox\.com/) && !url.endsWith('dl=1')) {
        if (url.endsWith('dl=0'))
            url = url.replace('dl=0', 'dl=1');
        else if (url.includes('?'))
            url += '&dl=1';
        else
            url += '?dl=1';
    }
    return url;
}
class Restore extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Restore);
        const { app, 'wait-interval': waitInterval, extensions, confirm, verbose } = flags;
        const interval = Math.max(3, waitInterval);
        const { addon: db } = await (0, fetcher_1.getAttachment)(this.heroku, app, args.database);
        const { name, wait } = (0, backups_1.default)(app, this.heroku);
        let backupURL;
        let backupName = args.backup;
        if (backupName && backupName.match(/^https?:\/\//)) {
            backupURL = dropboxURL(backupName);
        }
        else {
            let backupApp;
            if (backupName && backupName.match(/::/)) {
                [backupApp, backupName] = backupName.split('::');
            }
            else {
                backupApp = app;
            }
            const { body: transfers } = await this.heroku.get(`/client/v11/apps/${backupApp}/transfers`, { hostname: (0, host_1.default)() });
            const backups = transfers.filter(t => t.from_type === 'pg_dump' && t.to_type === 'gof3r');
            let backup;
            if (backupName) {
                backup = backups.find(b => name(b) === backupName);
                if (!backup)
                    throw new Error(`Backup ${color_1.default.cyan(backupName)} not found for ${color_1.default.app(backupApp)}`);
                if (!backup.succeeded)
                    throw new Error(`Backup ${color_1.default.cyan(backupName)} for ${color_1.default.app(backupApp)} did not complete successfully`);
            }
            else {
                backup = backups.filter(b => b.succeeded).sort((a, b) => {
                    if (a.finished_at < b.finished_at) {
                        return -1;
                    }
                    if (a.finished_at > b.finished_at) {
                        return 1;
                    }
                    return 0;
                }).pop();
                if (!backup) {
                    throw new Error(`No backups for ${color_1.default.app(backupApp)}. Capture one with ${color_1.default.cyan.bold('heroku pg:backups:capture')}`);
                }
                backupName = name(backup);
            }
            backupURL = backup.to_url;
        }
        await (0, confirmCommand_1.default)(app, confirm);
        core_1.ux.action.start(`Starting restore of ${color_1.default.cyan(backupName)} to ${color_1.default.yellow(db.name)}`);
        core_1.ux.log((0, tsheredoc_1.default)(`

    Use Ctrl-C at any time to stop monitoring progress; the backup will continue restoring.
    Use ${color_1.default.cyan.bold('heroku pg:backups')} to check progress.
    Stop a running restore with ${color_1.default.cyan.bold('heroku pg:backups:cancel')}.
    `));
        const { body: restore } = await this.heroku.post(`/client/v11/databases/${db.id}/restores`, {
            body: { backup_url: backupURL, extensions: this.getSortedExtensions(extensions) }, hostname: (0, host_1.default)(),
        });
        core_1.ux.action.stop();
        await wait('Restoring', restore.uuid, interval, verbose, db.app.id);
    }
    getSortedExtensions(extensions) {
        return extensions === null || extensions === void 0 ? void 0 : extensions.split(',').map(ext => ext.trim().toLowerCase()).sort();
    }
}
exports.default = Restore;
Restore.topic = 'pg';
Restore.description = 'restore a backup (default latest) to a database';
Restore.flags = {
    'wait-interval': command_1.flags.integer({ default: 3 }),
    extensions: command_1.flags.string({
        char: 'e',
        description: (0, tsheredoc_1.default)(`
      comma-separated list of extensions to pre-install in the public schema
      defaults to saving the latest database to DATABASE_URL
      `),
    }),
    verbose: command_1.flags.boolean({ char: 'v' }),
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Restore.args = {
    backup: core_1.Args.string({ description: 'URL or backup ID from another app' }),
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
Restore.examples = [
    (0, tsheredoc_1.default)(`
    # Basic Restore from Backup ID
    $ heroku pg:backups:restore b101 DATABASE_URL --app my-heroku-app
    `),
    (0, tsheredoc_1.default)(`
    # Restore from Another App
    $ heroku pg:backups:restore example-app::b101 DATABASE_URL --app my-heroku-app
    `),
    (0, tsheredoc_1.default)(`
    # Restore from a Public URL
    $ heroku pg:backups:restore 'https://s3.amazonaws.com/my-bucket/mydb.dump' DATABASE_URL --app my-heroku-app
    `),
    (0, tsheredoc_1.default)(`
    # Verbose Output
    $ heroku pg:backups:restore b101 DATABASE_URL --app my-heroku-app --verbose
    `),
    (0, tsheredoc_1.default)(`
    # Restore with Confirmation Prompt
    $ heroku pg:backups:restore b101 DATABASE_URL --app my-heroku-app --confirm my-heroku-app
    `),
    (0, tsheredoc_1.default)(`
    # Restore with a Specific Database Name
    $ heroku pg:backups:restore b101 HEROKU_POSTGRESQL_PINK --app my-heroku-app
    `),
];
