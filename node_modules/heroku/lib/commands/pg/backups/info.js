"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const backups_1 = require("../../../lib/pg/backups");
const lodash_1 = require("lodash");
function status(backup) {
    if (backup.succeeded) {
        if (backup.warnings > 0)
            return `Finished with ${backup.warnings} warnings`;
        return 'Completed';
    }
    if (backup.canceled_at)
        return 'Canceled';
    if (backup.finished_at)
        return 'Failed';
    if (backup.started_at)
        return 'Running';
    return 'Pending';
}
function compression(compressed, total) {
    let pct = 0;
    if (compressed > 0) {
        pct = Math.round((total - compressed) / total * 100);
        pct = Math.max(0, pct);
    }
    return ` (${pct}% compression)`;
}
class Info extends command_1.Command {
    constructor() {
        super(...arguments);
        this.getBackup = async (id, app) => {
            let backupID;
            if (id) {
                const { num } = (0, backups_1.default)(app, this.heroku);
                backupID = await num(id);
                if (!backupID)
                    throw new Error(`Invalid ID: ${id}`);
            }
            else {
                let { body: transfers } = await this.heroku.get(`/client/v11/apps/${app}/transfers`, { hostname: (0, host_1.default)() });
                transfers = (0, lodash_1.sortBy)(transfers, 'created_at');
                const backups = transfers.filter(t => t.from_type === 'pg_dump' && t.to_type === 'gof3r');
                const lastBackup = backups.pop();
                if (!lastBackup)
                    throw new Error(`No backups. Capture one with ${color_1.default.cyan.bold('heroku pg:backups:capture')}`);
                backupID = lastBackup.num;
            }
            const { body: backup } = await this.heroku.get(`/client/v11/apps/${app}/transfers/${backupID}?verbose=true`, { hostname: (0, host_1.default)() });
            return backup;
        };
        this.displayBackup = (backup, app) => {
            const { filesize, name } = (0, backups_1.default)(app, this.heroku);
            core_1.ux.styledHeader(`Backup ${color_1.default.cyan(name(backup))}`);
            core_1.ux.styledObject({
                Database: color_1.default.green(backup.from_name),
                'Started at': backup.started_at,
                'Finished at': backup.finished_at,
                Status: status(backup),
                Type: backup.schedule ? 'Scheduled' : 'Manual', 'Original DB Size': filesize(backup.source_bytes),
                'Backup Size': `${filesize(backup.processed_bytes)}${backup.finished_at ? compression(backup.processed_bytes, backup.source_bytes) : ''}`,
            }, ['Database', 'Started at', 'Finished at', 'Status', 'Type', 'Original DB Size', 'Backup Size']);
            core_1.ux.log();
        };
        this.displayLogs = (backup) => {
            core_1.ux.styledHeader('Backup Logs');
            for (const log of backup.logs)
                core_1.ux.log(`${log.created_at} ${log.message}`);
            core_1.ux.log();
        };
    }
    async run() {
        const { flags, args } = await this.parse(Info);
        const { app } = flags;
        const { backup_id } = args;
        const backup = await this.getBackup(backup_id, app);
        this.displayBackup(backup, app);
        this.displayLogs(backup);
    }
}
exports.default = Info;
Info.topic = 'pg';
Info.description = 'get information about a specific backup';
Info.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Info.args = {
    backup_id: core_1.Args.string({ description: 'ID of the backup. If omitted, we use the last backup ID.' }),
};
