"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const resolve_1 = require("../../../lib/addons/resolve");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const util_1 = require("../../../lib/pg/util");
const nls_1 = require("../../../nls");
class Create extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Create);
        const { app } = flags;
        const service = async (remoteId) => {
            const addon = await (0, resolve_1.addonResolver)(this.heroku, app, remoteId);
            if (!addon.plan.name.match(/^heroku-(redis|postgresql)/))
                throw new Error('Remote database must be heroku-redis or heroku-postgresql');
            return addon;
        };
        const [db, target] = await Promise.all([
            (0, fetcher_1.getAddon)(this.heroku, app, args.database),
            service(args.remote),
        ]);
        if ((0, util_1.essentialPlan)(db))
            throw new Error('pg:links isn’t available for Essential-tier databases.');
        if ((0, util_1.essentialPlan)(target))
            throw new Error('pg:links isn’t available for Essential-tier databases.');
        core_1.ux.action.start(`Adding link from ${color_1.default.yellow(target.name)} to ${color_1.default.yellow(db.name)}`);
        const { body: link } = await this.heroku.post(`/client/v11/databases/${db.id}/links`, {
            body: {
                target: target.name,
                as: flags.as,
            },
            hostname: (0, host_1.default)(),
        });
        if (link.message) {
            throw new Error(link.message);
        }
        core_1.ux.action.stop(`done, ${color_1.default.cyan(link.name)}`);
    }
}
exports.default = Create;
Create.topic = 'pg';
Create.description = (0, tsheredoc_1.default)(`
  create a link between data stores
  Example:
  heroku pg:links:create HEROKU_REDIS_RED HEROKU_POSTGRESQL_CERULEAN
  `);
Create.flags = {
    as: command_1.flags.string({ description: 'name of link to create' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Create.args = {
    remote: core_1.Args.string({ required: true, description: (0, nls_1.nls)('pg:database:arg:description') }),
    database: core_1.Args.string({ required: true, description: (0, nls_1.nls)('pg:database:arg:description') }),
};
