"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../../lib/pg/fetcher");
const util_1 = require("../../../lib/pg/util");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
class Destroy extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Destroy);
        const { app, confirm } = flags;
        const { database, link } = args;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        if ((0, util_1.essentialPlan)(db))
            throw new Error('pg:links isn’t available for Essential-tier databases.');
        await (0, confirmCommand_1.default)(app, confirm, (0, tsheredoc_1.default)(`
      Destructive action
      This command will affect the database ${color_1.default.yellow(db.name)}
      This will delete ${color_1.default.cyan(link)} along with the tables and views created within it.
      This may have adverse effects for software written against the ${color_1.default.cyan(link)} schema.
    `));
        core_1.ux.action.start(`Destroying link ${color_1.default.cyan(link)} from ${color_1.default.yellow(db.name)}`);
        await this.heroku.delete(`/client/v11/databases/${db.id}/links/${encodeURIComponent(link)}`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
    }
}
exports.default = Destroy;
Destroy.topic = 'pg';
Destroy.description = 'destroys a link between data stores';
Destroy.example = '$ heroku pg:links:destroy HEROKU_POSTGRESQL_CERULEAN redis-symmetrical-100';
Destroy.flags = {
    app: command_1.flags.app({ required: true }),
    confirm: command_1.flags.string({ char: 'c' }),
    remote: command_1.flags.remote(),
};
Destroy.args = {
    database: core_1.Args.string({ required: true, description: (0, nls_1.nls)('pg:database:arg:description') }),
    link: core_1.Args.string({ required: true, description: 'name of the linked data store' }),
};
