"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const backups_1 = require("../../../lib/pg/backups");
const lodash_1 = require("lodash");
class Url extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Url);
        const { backup_id } = args;
        const { app } = flags;
        let num;
        if (backup_id) {
            num = await (0, backups_1.default)(app, this.heroku).num(backup_id);
            if (!num)
                throw new Error(`Invalid Backup: ${backup_id}`);
        }
        else {
            const { body: transfers } = await this.heroku.get(`/client/v11/apps/${app}/transfers`, { hostname: (0, host_1.default)() });
            const lastBackup = (0, lodash_1.sortBy)(transfers.filter(t => t.succeeded && t.to_type === 'gof3r'), 'created_at')
                .pop();
            if (!lastBackup)
                throw new Error(`No backups on ${color_1.default.app(app)}. Capture one with ${color_1.default.cyan.bold('heroku pg:backups:capture')}`);
            num = lastBackup.num;
        }
        const { body: info } = await this.heroku.post(`/client/v11/apps/${app}/transfers/${num}/actions/public-url`, { hostname: (0, host_1.default)() });
        core_1.ux.log(info.url);
    }
}
exports.default = Url;
Url.topic = 'pg';
Url.description = 'get secret but publicly accessible URL of a backup';
Url.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Url.args = {
    backup_id: core_1.Args.string({ description: 'ID of the backup. If omitted, we use the last backup ID.' }),
};
