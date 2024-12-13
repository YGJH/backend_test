"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
class Credentials extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Credentials);
        const { app, reset } = flags;
        const { database } = args;
        const addon = await (0, api_1.default)(app, database, false, this.heroku).getRedisAddon();
        if (reset) {
            core_1.ux.log(`Resetting credentials for ${addon.name}`);
            await (0, api_1.default)(app, database, false, this.heroku).request(`/redis/v0/databases/${addon.name}/credentials_rotation`, 'POST');
        }
        else {
            const { body: redis } = await (0, api_1.default)(app, database, false, this.heroku).request(`/redis/v0/databases/${addon.name}`);
            core_1.ux.log(redis.resource_url);
        }
    }
}
exports.default = Credentials;
Credentials.topic = 'redis';
Credentials.description = 'display credentials information';
Credentials.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    reset: command_1.flags.boolean({ description: 'reset credentials' }),
};
Credentials.args = {
    database: core_1.Args.string({ required: false, description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
