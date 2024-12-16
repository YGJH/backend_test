"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const backups_1 = require("../../../lib/pg/backups");
const host_1 = require("../../../lib/pg/host");
class Index extends command_1.Command {
    async run() {
        const { flags: { app } } = await this.parse(Index);
        const { body: transfers } = await this.heroku.get(`/client/v11/apps/${app}/transfers`, { hostname: (0, host_1.default)() });
        // NOTE that the sort order is descending
        transfers.sort((transferA, transferB) => {
            if (transferA.created_at > transferB.created_at) {
                return -1;
            }
            if (transferB.created_at > transferA.created_at) {
                return 1;
            }
            return 0;
        });
        this.displayBackups(transfers, app);
        this.displayRestores(transfers, app);
        this.displayCopies(transfers, app);
    }
    displayBackups(transfers, app) {
        const backups = transfers.filter(backupTransfer => backupTransfer.from_type === 'pg_dump' && backupTransfer.to_type === 'gof3r');
        const { name, status, filesize } = (0, backups_1.default)(app, this.heroku);
        core_1.ux.styledHeader('Backups');
        if (backups.length === 0) {
            core_1.ux.log(`No backups. Capture one with ${color_1.default.cyan.bold('heroku pg:backups:capture')}`);
        }
        else {
            core_1.ux.table(backups, {
                ID: {
                    get: (transfer) => color_1.default.cyan(name(transfer)),
                },
                'Created at': {
                    get: (transfer) => transfer.created_at,
                },
                Status: {
                    get: (transfer) => status(transfer),
                },
                Size: {
                    get: (transfer) => filesize(transfer.processed_bytes),
                },
                Database: {
                    get: (transfer) => color_1.default.green(transfer.from_name) || 'UNKNOWN',
                },
            });
        }
        core_1.ux.log();
    }
    displayRestores(transfers, app) {
        const restores = transfers
            .filter(t => t.from_type !== 'pg_dump' && t.to_type === 'pg_restore')
            .slice(0, 10); // first 10 only
        const { name, status, filesize } = (0, backups_1.default)(app, this.heroku);
        core_1.ux.styledHeader('Restores');
        if (restores.length === 0) {
            core_1.ux.log(`No restores found. Use ${color_1.default.cyan.bold('heroku pg:backups:restore')} to restore a backup`);
        }
        else {
            core_1.ux.table(restores, {
                ID: {
                    get: (transfer) => color_1.default.cyan(name(transfer)),
                },
                'Started at': {
                    get: (transfer) => transfer.created_at,
                },
                Status: {
                    get: (transfer) => status(transfer),
                },
                Size: {
                    get: (transfer) => filesize(transfer.processed_bytes),
                },
                Database: {
                    get: (transfer) => color_1.default.green(transfer.to_name) || 'UNKNOWN',
                },
            });
        }
        core_1.ux.log();
    }
    displayCopies(transfers, app) {
        const { name, status, filesize } = (0, backups_1.default)(app, this.heroku);
        const copies = transfers.filter(t => t.from_type === 'pg_dump' && t.to_type === 'pg_restore').slice(0, 10);
        core_1.ux.styledHeader('Copies');
        if (copies.length === 0) {
            core_1.ux.log(`No copies found. Use ${color_1.default.cyan.bold('heroku pg:copy')} to copy a database to another`);
        }
        else {
            core_1.ux.table(copies, {
                ID: {
                    get: (transfer) => color_1.default.cyan(name(transfer)),
                },
                'Started at': {
                    get: (transfer) => transfer.created_at,
                },
                Status: {
                    get: (transfer) => status(transfer),
                },
                Size: {
                    get: (transfer) => filesize(transfer.processed_bytes),
                },
                From: {
                    get: (transfer) => color_1.default.green(transfer.from_name) || 'UNKNOWN',
                },
                To: {
                    get: (transfer) => color_1.default.green(transfer.to_name) || 'UNKNOWN',
                },
            });
        }
        core_1.ux.log();
    }
}
exports.default = Index;
Index.topic = 'pg';
Index.description = 'list database backups';
Index.strict = false;
Index.flags = {
    verbose: command_1.flags.boolean({ char: 'v', hidden: true }),
    confirm: command_1.flags.string({ char: 'c', hidden: true }),
    output: command_1.flags.string({ char: 'o', hidden: true }),
    'wait-interval': command_1.flags.string({ hidden: true }),
    at: command_1.flags.string({ hidden: true }),
    quiet: command_1.flags.boolean({ char: 'q', hidden: true }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
