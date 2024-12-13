"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
class Unschedule extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Unschedule);
        const { app } = flags;
        const { database } = args;
        let db = database;
        if (!db) {
            const appDB = await (0, fetcher_1.arbitraryAppDB)(this.heroku, app);
            const { body: schedules } = await this.heroku.get(`/client/v11/databases/${appDB.id}/transfer-schedules`, { hostname: (0, host_1.default)() });
            if (schedules.length === 0)
                throw new Error(`No schedules on ${color_1.default.app(app)}`);
            if (schedules.length > 1) {
                throw new Error(`Specify schedule on ${color_1.default.app(app)}. Existing schedules: ${schedules.map(s => color_1.default.green(s.name))
                    .join(', ')}`);
            }
            db = schedules[0].name;
        }
        core_1.ux.action.start(`Unscheduling ${color_1.default.green(db)} daily backups`);
        const addon = await (0, fetcher_1.getAddon)(this.heroku, app, db);
        const { body: schedules } = await this.heroku.get(`/client/v11/databases/${addon.id}/transfer-schedules`, { hostname: (0, host_1.default)() });
        const schedule = schedules.find(s => s.name.match(new RegExp(`${db}`, 'i')));
        if (!schedule)
            throw new Error(`No daily backups found for ${color_1.default.yellow(addon.name)}`);
        await this.heroku.delete(`/client/v11/databases/${addon.id}/transfer-schedules/${schedule.uuid}`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
    }
}
exports.default = Unschedule;
Unschedule.topic = 'pg';
Unschedule.description = 'stop daily backups';
Unschedule.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Unschedule.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:arbitrary:suffix')}` }),
};
