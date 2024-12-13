"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../../lib/pg/host");
const tsheredoc_1 = require("tsheredoc");
const util_1 = require("../../../lib/pg/util");
const fetcher_1 = require("../../../lib/pg/fetcher");
const nls_1 = require("../../../nls");
class Attach extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Attach);
        const { app } = flags;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, args.database);
        const { body: addon } = await this.heroku.get(`/addons/${encodeURIComponent(db.name)}`);
        if ((0, util_1.essentialPlan)(db))
            core_1.ux.error('You can’t perform this operation on Essential-tier databases.');
        core_1.ux.action.start(`Enabling Connection Pooling on ${color_1.default.yellow(addon.name)} to ${color_1.default.magenta(app)}`);
        const { body: attachment } = await this.heroku.post(`/client/v11/databases/${encodeURIComponent(db.name)}/connection-pooling`, {
            body: { name: flags.as, credential: 'default', app: app }, hostname: (0, host_1.default)(),
        });
        core_1.ux.action.stop();
        core_1.ux.action.start(`Setting ${color_1.default.cyan(attachment.name)} config vars and restarting ${color_1.default.magenta(app)}`);
        const { body: releases } = await this.heroku.get(`/apps/${app}/releases`, { partial: true, headers: { Range: 'version ..; max=1, order=desc' } });
        core_1.ux.action.stop(`done, v${releases[0].version}`);
    }
}
exports.default = Attach;
Attach.topic = 'pg';
Attach.description = 'add an attachment to a database using connection pooling';
Attach.examples = [(0, tsheredoc_1.default) `
      $ heroku pg:connection-pooling:attach postgresql-something-12345
    `];
Attach.flags = {
    as: command_1.flags.string({ description: 'name for add-on attachment' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Attach.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
