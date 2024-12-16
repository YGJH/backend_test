"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const resolve_1 = require("../../../lib/addons/resolve");
const util_1 = require("../../../lib/pg/util");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
class Index extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Index);
        const { app } = flags;
        const { database } = args;
        const db = await (0, resolve_1.addonResolver)(this.heroku, app, database || 'DATABASE_URL');
        if ((0, util_1.essentialPlan)(db))
            core_1.ux.error('You can’t perform this operation on Essential-tier databases.');
        const { body: settings } = await this.heroku.get(`/postgres/v0/databases/${db.id}/config`, { hostname: (0, host_1.default)() });
        core_1.ux.styledHeader(db.name);
        const remapped = {};
        Object.keys(settings).forEach(k => {
            remapped[k.replace(/_/g, '-')] = settings[k].value;
        });
        core_1.ux.styledObject(remapped);
    }
}
exports.default = Index;
Index.topic = 'pg';
Index.description = 'show your current database settings';
Index.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Index.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
