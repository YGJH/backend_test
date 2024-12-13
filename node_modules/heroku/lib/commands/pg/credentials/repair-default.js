"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../../lib/pg/fetcher");
const util_1 = require("../../../lib/pg/util");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
class RepairDefault extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(RepairDefault);
        const { app, confirm } = flags;
        const { database } = args;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        if ((0, util_1.essentialPlan)(db))
            throw new Error("You can't perform this operation on Essential-tier databases.");
        await (0, confirmCommand_1.default)(app, confirm, (0, tsheredoc_1.default)(`
      Destructive Action
      Ownership of all database objects owned by additional credentials will be transferred to the default credential.
      This command will also grant the default credential admin option for all additional credentials.
    `));
        core_1.ux.action.start('Resetting permissions and object ownership for default role to factory settings');
        await this.heroku.post(`/postgres/v0/databases/${db.name}/repair-default`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
    }
}
exports.default = RepairDefault;
RepairDefault.topic = 'pg';
RepairDefault.description = 'repair the permissions of the default credential within database';
RepairDefault.example = '$ heroku pg:credentials:repair-default postgresql-something-12345';
RepairDefault.flags = {
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
RepairDefault.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
