"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../../lib/pg/util");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const nls_1 = require("../../../nls");
class Destroy extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Destroy);
        const { database } = args;
        const { app, name, confirm } = flags;
        if (name === 'default') {
            throw new Error('Default credential cannot be destroyed.');
        }
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        if ((0, util_1.essentialPlan)(db)) {
            throw new Error("You can't destroy the default credential on Essential-tier databases.");
        }
        const { body: attachments } = await this.heroku.get(`/addons/${db.name}/addon-attachments`);
        const credAttachments = attachments.filter(a => a.namespace === `credential:${name}`);
        const credAttachmentApps = Array.from(new Set(credAttachments.map(a => { var _a; return (_a = a.app) === null || _a === void 0 ? void 0 : _a.name; })));
        if (credAttachmentApps.length > 0)
            throw new Error(`Credential ${name} must be detached from the app${credAttachmentApps.length > 1 ? 's' : ''} ${credAttachmentApps.map(appName => color_1.default.app(appName || ''))
                .join(', ')} before destroying.`);
        await (0, confirmCommand_1.default)(app, confirm);
        core_1.ux.action.start(`Destroying credential ${color_1.default.cyan.bold(name)}`);
        await this.heroku.delete(`/postgres/v0/databases/${db.name}/credentials/${encodeURIComponent(name)}`, { hostname: (0, host_1.default)() });
        core_1.ux.action.stop();
        core_1.ux.log(`The credential has been destroyed within ${db.name}.`);
        core_1.ux.log(`Database objects owned by ${name} will be assigned to the default credential.`);
    }
}
exports.default = Destroy;
Destroy.topic = 'pg';
Destroy.description = 'destroy credential within database';
Destroy.example = '$ heroku pg:credentials:destroy postgresql-transparent-56874 --name cred-name -a woodstock-production';
Destroy.flags = {
    name: command_1.flags.string({ char: 'n', required: true, description: 'unique identifier for the credential' }),
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Destroy.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
