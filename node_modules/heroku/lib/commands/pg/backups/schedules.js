"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const fetcher_1 = require("../../../lib/pg/fetcher");
class Schedules extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Schedules);
        const { app } = flags;
        const db = await (0, fetcher_1.arbitraryAppDB)(this.heroku, app);
        const { body: schedules } = await this.heroku.get(`/client/v11/databases/${db.id}/transfer-schedules`, { hostname: (0, host_1.default)() });
        if (schedules.length === 0) {
            core_1.ux.warn(`No backup schedules found on ${color_1.default.app(app)}\nUse ${color_1.default.cyan.bold('heroku pg:backups:schedule')} to set one up`);
        }
        else {
            core_1.ux.styledHeader('Backup Schedules');
            for (const s of schedules) {
                core_1.ux.log(`${color_1.default.green(s.name)}: daily at ${s.hour}:00 ${s.timezone}`);
            }
        }
    }
}
exports.default = Schedules;
Schedules.topic = 'pg';
Schedules.description = 'list backup schedule';
Schedules.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
