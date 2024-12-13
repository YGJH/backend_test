"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const backups_1 = require("../../../lib/pg/backups");
const lodash_1 = require("lodash");
const download_1 = require("../../../lib/pg/download");
const fs = require("fs-extra");
function defaultFilename() {
    let f = 'latest.dump';
    if (!fs.existsSync(f))
        return f;
    let i = 1;
    do
        f = `latest.dump.${i++}`;
    while (fs.existsSync(f));
    return f;
}
class Download extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Download);
        const { backup_id } = args;
        const { app } = flags;
        const output = flags.output || defaultFilename();
        let num;
        core_1.ux.action.start(`Getting backup from ${color_1.default.magenta(app)}`);
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
                throw new Error(`No backups on ${color_1.default.magenta(app)}. Capture one with ${color_1.default.cyan.bold('heroku pg:backups:capture')}`);
            num = lastBackup.num;
        }
        core_1.ux.action.status = `fetching url of #${num}`;
        const { body: info } = await this.heroku.post(`/client/v11/apps/${app}/transfers/${num}/actions/public-url`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop(`done, #${num}`);
        await (0, download_1.default)(info.url, output, { progress: true });
    }
}
exports.default = Download;
Download.topic = 'pg';
Download.description = 'downloads database backup';
Download.flags = {
    output: command_1.flags.string({ char: 'o', description: 'location to download to. Defaults to latest.dump' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Download.args = {
    backup_id: core_1.Args.string({ description: 'ID of the backup. If omitted, we use the last backup ID.' }),
};
