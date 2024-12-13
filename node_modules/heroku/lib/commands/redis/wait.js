"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
const wait = (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});
class Wait extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Wait);
        const { app, 'wait-interval': waitInterval } = flags;
        const { database } = args;
        const api = (0, api_1.default)(app, database, false, this.heroku);
        const addon = await api.getRedisAddon();
        const waitFor = async () => {
            let interval = waitInterval && Number.parseInt(waitInterval, 10);
            if (!interval || interval < 0)
                interval = 5;
            let status;
            let waiting = false;
            while (true) {
                try {
                    status = await api.request(`/redis/v0/databases/${addon.name}/wait`, 'GET').then(response => response.body);
                }
                catch (error) {
                    const httpError = error;
                    if (httpError.statusCode !== 404)
                        throw httpError;
                    status = { message: 'not found', 'waiting?': true };
                }
                if (!status['waiting?']) {
                    if (waiting) {
                        core_1.ux.action.stop(status.message);
                    }
                    return;
                }
                if (!waiting) {
                    waiting = true;
                    core_1.ux.action.start(`Waiting for database ${color_1.default.yellow(addon.name)}`, status.message);
                }
                core_1.ux.action.status = status.message;
                await wait(interval * 1000);
            }
        };
        await waitFor();
    }
}
exports.default = Wait;
Wait.topic = 'redis';
Wait.description = 'wait for Redis instance to be available';
Wait.flags = {
    'wait-interval': command_1.flags.string({ description: 'how frequently to poll in seconds' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Wait.args = {
    database: core_1.Args.string({ required: false, description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
