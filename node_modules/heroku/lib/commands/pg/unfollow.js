"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../lib/pg/fetcher");
const host_1 = require("../../lib/pg/host");
const util_1 = require("../../lib/pg/util");
const confirmCommand_1 = require("../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../nls");
class Unfollow extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Unfollow);
        const { app, confirm } = flags;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, args.database);
        const { body: replica } = await this.heroku.get(`/client/v11/databases/${db.id}`, { hostname: (0, host_1.default)() });
        if (!replica.following)
            core_1.ux.error(`${color_1.default.addon(db.name)} is not a follower`);
        const { body: configVars } = await this.heroku.get(`/apps/${app}/config-vars`);
        const origin = (0, util_1.databaseNameFromUrl)(replica.following, configVars);
        await (0, confirmCommand_1.default)(app, confirm, (0, tsheredoc_1.default)(`
      Destructive action
      ${color_1.default.addon(db.name)} will become writeable and no longer follow ${origin}. This cannot be undone.
    `));
        core_1.ux.action.start(`${color_1.default.addon(db.name)} unfollowing`);
        await this.heroku.put(`/client/v11/databases/${db.id}/unfollow`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
    }
}
exports.default = Unfollow;
Unfollow.topic = 'pg';
Unfollow.description = 'stop a replica from following and make it a writeable database';
Unfollow.flags = {
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Unfollow.args = {
    database: core_1.Args.string({ required: true, description: (0, nls_1.nls)('pg:database:arg:description') }),
};
