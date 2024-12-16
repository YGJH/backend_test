"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
class Timeout extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Timeout);
        const { app, seconds } = flags;
        const { database } = args;
        const addon = await (0, api_1.default)(app, database, false, this.heroku).getRedisAddon();
        const { body: response } = await (0, api_1.default)(app, database, false, this.heroku)
            .request(`/redis/v0/databases/${addon.id}/config`, 'PATCH', { timeout: seconds });
        core_1.ux.log(`Timeout for ${addon.name} (${addon.config_vars.join(', ')}) set to ${response.timeout.value} seconds.`);
        if (response.timeout.value === 0) {
            core_1.ux.log('Connections to the Redis instance can idle indefinitely.');
        }
        else {
            core_1.ux.log(`Connections to the Redis instance will be stopped after idling for ${response.timeout.value} seconds.`);
        }
    }
}
exports.default = Timeout;
Timeout.topic = 'redis';
Timeout.description = `set the number of seconds to wait before killing idle connections
    A value of zero means that connections will not be closed.
  `;
Timeout.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    seconds: command_1.flags.integer({ char: 's', description: 'set timeout value', required: true }),
};
Timeout.args = {
    database: core_1.Args.string({ description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
