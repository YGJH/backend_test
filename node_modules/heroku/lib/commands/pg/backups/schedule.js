"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const fetcher_1 = require("../../../lib/pg/fetcher");
const nls_1 = require("../../../nls");
const TZ = {
    PST: 'America/Los_Angeles',
    PDT: 'America/Los_Angeles',
    MST: 'America/Boise',
    MDT: 'America/Boise',
    CST: 'America/Chicago',
    CDT: 'America/Chicago',
    EST: 'America/New_York',
    EDT: 'America/New_York',
    Z: 'UTC',
    GMT: 'Europe/London',
    BST: 'Europe/London',
    CET: 'Europe/Paris',
    CEST: 'Europe/Paris',
};
class Schedule extends command_1.Command {
    constructor() {
        super(...arguments);
        this.parseDate = function (at) {
            const m = at.match(/^(0?\d|1\d|2[0-3]):00 ?(\S*)$/);
            if (m) {
                const [, hour, timezone] = m;
                return { hour, timezone: TZ[timezone.toUpperCase()] || timezone || 'UTC' };
            }
            return core_1.ux.error("Invalid schedule format: expected --at '[HOUR]:00 [TIMEZONE]'", { exit: 1 });
        };
    }
    async run() {
        var _a;
        const { flags, args } = await this.parse(Schedule);
        const { app } = flags;
        const { database } = args;
        const schedule = this.parseDate(flags.at);
        const attachment = await (0, fetcher_1.getAttachment)(this.heroku, app, database);
        const db = attachment.addon;
        const at = color_1.default.cyan(`${schedule.hour}:00 ${schedule.timezone}`);
        const pgResponse = await this.heroku.get(`/client/v11/databases/${db.id}`, { hostname: (0, host_1.default)() })
            .catch((error) => {
            if (error.statusCode !== 404)
                throw error;
            core_1.ux.error(`${color_1.default.yellow(db.name)} is not yet provisioned.\nRun ${color_1.default.cyan.bold('heroku addons:wait')} to wait until the db is provisioned.`, { exit: 1 });
        });
        const { body: dbInfo } = pgResponse || { body: null };
        if (dbInfo) {
            const dbProtected = /On/.test(((_a = dbInfo.info.find(attribute => attribute.name === 'Continuous Protection')) === null || _a === void 0 ? void 0 : _a.values[0]) || '');
            if (dbProtected) {
                core_1.ux.warn('Continuous protection is already enabled for this database. Logical backups of large databases are likely to fail.');
                core_1.ux.warn('See https://devcenter.heroku.com/articles/heroku-postgres-data-safety-and-continuous-protection#physical-backups-on-heroku-postgres.');
            }
        }
        core_1.ux.action.start(`Scheduling automatic daily backups of ${color_1.default.yellow(db.name)} at ${at}`);
        schedule.schedule_name = attachment.name + '_URL';
        await this.heroku.post(`/client/v11/databases/${db.id}/transfer-schedules`, {
            body: schedule, hostname: (0, host_1.default)(),
        });
        core_1.ux.action.stop();
    }
}
exports.default = Schedule;
Schedule.topic = 'pg';
Schedule.description = 'schedule daily backups for given database';
Schedule.flags = {
    at: command_1.flags.string({ required: true, description: "at a specific (24h) hour in the given timezone. Defaults to UTC. --at '[HOUR]:00 [TIMEZONE]'" }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Schedule.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
