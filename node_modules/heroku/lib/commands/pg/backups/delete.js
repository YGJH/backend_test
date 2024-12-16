"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const host_1 = require("../../../lib/pg/host");
const backups_1 = require("../../../lib/pg/backups");
class Delete extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Delete);
        const { app, confirm } = flags;
        const { backup_id } = args;
        const pgbackups = (0, backups_1.default)(app, this.heroku);
        await (0, confirmCommand_1.default)(app, confirm);
        core_1.ux.action.start(`Deleting backup ${color_1.default.cyan(backup_id)} on ${color_1.default.app(app)}`);
        const num = await pgbackups.num(backup_id);
        if (!num) {
            throw new Error(`Invalid Backup: ${backup_id}`);
        }
        await this.heroku.delete(`/client/v11/apps/${app}/transfers/${num}`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
    }
}
exports.default = Delete;
Delete.topic = 'pg';
Delete.description = 'delete a backup';
Delete.flags = {
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Delete.args = {
    backup_id: core_1.Args.string({ required: true, description: 'ID of the backup' }),
};
Delete.examples = [
    '$ heroku pg:backup:delete --app APP_ID BACKUP_ID',
];
