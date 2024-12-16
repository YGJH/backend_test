"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const util_1 = require("../../../lib/pg/util");
const nls_1 = require("../../../nls");
class Create extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Create);
        const { app, name } = flags;
        const { addon: db } = await (0, fetcher_1.getAttachment)(this.heroku, app, args.database);
        if ((0, util_1.essentialPlan)(db)) {
            throw new Error("You can't create a custom credential on Essential-tier databases.");
        }
        const data = { name };
        core_1.ux.action.start(`Creating credential ${color_1.default.cyan.bold(name)}`);
        await this.heroku.post(`/postgres/v0/databases/${db.name}/credentials`, { hostname: (0, host_1.default)(), body: data });
        core_1.ux.action.stop();
        const attachCmd = `heroku addons:attach ${db.name} --credential ${name} -a ${app}`;
        const psqlCmd = `heroku pg:psql ${db.name} -a ${app}`;
        core_1.ux.log((0, tsheredoc_1.default)(`

      Please attach the credential to the apps you want to use it in by running ${color_1.default.cyan.bold(attachCmd)}.
      Please define the new grants for the credential within Postgres: ${color_1.default.cyan.bold(psqlCmd)}.`));
    }
}
exports.default = Create;
Create.topic = 'pg';
Create.description = 'create credential within database\nExample:\n\n    heroku pg:credentials:create postgresql-something-12345 --name new-cred-name\n';
Create.flags = {
    name: command_1.flags.string({ char: 'n', required: true, description: 'name of the new credential within the database' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Create.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
