"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const debug_1 = require("debug");
const fetcher_1 = require("../../lib/pg/fetcher");
const host_1 = require("../../lib/pg/host");
const notify_1 = require("../../lib/notify");
const nls_1 = require("../../nls");
const wait = (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});
class Wait extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Wait);
        const { app, 'wait-interval': waitInterval } = flags;
        const dbName = args.database;
        const pgDebug = (0, debug_1.default)('pg');
        const waitFor = async (db) => {
            let interval = waitInterval && Number.parseInt(waitInterval, 10);
            if (!interval || interval < 0)
                interval = 5;
            let status;
            let waiting = false;
            let retries = 20;
            while (true) {
                try {
                    ({ body: status } = await this.heroku.get(`/client/v11/databases/${db.id}/wait_status`, { hostname: (0, host_1.default)() }));
                }
                catch (error) {
                    const httpError = error;
                    pgDebug(httpError);
                    if (!retries || httpError.statusCode !== 404)
                        throw httpError;
                    retries--;
                    status = { 'waiting?': true };
                }
                if (status['error?']) {
                    (0, notify_1.default)('error', `${db.name} ${status.message}`, false);
                    core_1.ux.error(status.message || '', { exit: 1 });
                }
                if (!status['waiting?']) {
                    if (waiting) {
                        core_1.ux.action.stop(status.message);
                    }
                    return;
                }
                if (!waiting) {
                    waiting = true;
                    core_1.ux.action.start(`Waiting for database ${color_1.default.yellow(db.name)}`, status.message);
                }
                core_1.ux.action.status = status.message;
                await wait(interval * 1000);
            }
        };
        let dbs = [];
        if (dbName) {
            dbs = [await (0, fetcher_1.getAddon)(this.heroku, app, dbName)];
        }
        else {
            dbs = await (0, fetcher_1.all)(this.heroku, app);
        }
        for (const db of dbs) {
            await waitFor(db);
        }
    }
}
exports.default = Wait;
Wait.topic = 'pg';
Wait.description = 'blocks until database is available';
Wait.flags = {
    'wait-interval': command_1.flags.string({ description: 'how frequently to poll in seconds (to avoid rate limiting)' }),
    'no-notify': command_1.flags.boolean({ description: 'do not show OS notification' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Wait.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:all-dbs:suffix')}` }),
};
