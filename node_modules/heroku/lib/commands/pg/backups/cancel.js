"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const backups_1 = require("../../../lib/pg/backups");
class Cancel extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Cancel);
        const { app } = flags;
        const { backup_id } = args;
        const pgbackups = (0, backups_1.default)(app, this.heroku);
        let transfer;
        if (backup_id) {
            const num = await pgbackups.num(backup_id);
            if (!num) {
                core_1.ux.error(`Invalid Backup: ${backup_id}`);
            }
            ({ body: transfer } = await this.heroku.get(`/client/v11/apps/${app}/transfers/${num}`, { hostname: (0, host_1.default)() }));
        }
        else {
            const { body: transfers } = await this.heroku.get(`/client/v11/apps/${app}/transfers`, { hostname: (0, host_1.default)() });
            transfer = this.sortByCreatedAtDesc(transfers).find(t => !t.finished_at);
        }
        if (transfer) {
            core_1.ux.action.start(`Cancelling ${pgbackups.name(transfer)}`);
            this.heroku.post(`/client/v11/apps/${app}/transfers/${transfer.uuid}/actions/cancel`, { hostname: (0, host_1.default)() });
            core_1.ux.action.stop();
        }
        else {
            core_1.ux.error('No active backups/transfers');
        }
    }
    sortByCreatedAtDesc(transfers) {
        return transfers.sort((a, b) => {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    }
}
exports.default = Cancel;
Cancel.topic = 'pg';
Cancel.description = 'cancel an in-progress backup or restore (default newest)';
Cancel.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Cancel.args = {
    backup_id: core_1.Args.string({ description: 'ID of the backup. If omitted, we use the last unfinished backup ID.' }),
};
