"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
const confirmCommand_1 = require("../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
const color_1 = require("@heroku-cli/color");
class Upgrade extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Upgrade);
        const { app, version, confirm } = flags;
        const { database } = args;
        const addon = await (0, api_1.default)(app, database, false, this.heroku).getRedisAddon();
        const warning = (0, tsheredoc_1.default)(`
      WARNING: Irreversible action.
      Redis database will be upgraded to ${color_1.default.configVar(version)}. This cannot be undone.
    `);
        await (0, confirmCommand_1.default)(app, confirm, warning);
        core_1.ux.action.start(`Requesting upgrade of ${color_1.default.addon(addon.name || '')} to ${version}`);
        const { body: response } = await (0, api_1.default)(app, database, false, this.heroku)
            .request(`/redis/v0/databases/${addon.id}/upgrade`, 'POST', { version: version });
        core_1.ux.action.stop(response.message);
    }
}
exports.default = Upgrade;
Upgrade.topic = 'redis';
Upgrade.description = 'perform in-place version upgrade';
Upgrade.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    version: command_1.flags.string({ char: 'v', required: true }),
    confirm: command_1.flags.string({ char: 'c' }),
};
Upgrade.args = {
    database: core_1.Args.string({ description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
