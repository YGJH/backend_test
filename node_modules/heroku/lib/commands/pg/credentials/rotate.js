"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const util_1 = require("../../../lib/pg/util");
const nls_1 = require("../../../nls");
class Rotate extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Rotate);
        const { app, all, confirm, name, force } = flags;
        const { addon: db } = await (0, fetcher_1.getAttachment)(this.heroku, app, args.database);
        const warnings = [];
        const cred = name || 'default';
        if (all && name !== undefined) {
            throw new Error('cannot pass both --all and --name');
        }
        if ((0, util_1.legacyEssentialPlan)(db) && cred !== 'default') {
            throw new Error('Legacy Essential-tier databases do not support named credentials.');
        }
        if (all && force) {
            warnings.push('This forces rotation on all credentials including the default credential.');
        }
        let { body: attachments } = await this.heroku.get(`/addons/${db.name}/addon-attachments`);
        if (name) {
            attachments = attachments.filter(a => a.namespace === `credential:${cred}`);
        }
        if (!all) {
            warnings.push(`The password for the ${cred} credential will rotate.`);
        }
        if (all || force || cred === 'default') {
            warnings.push('Connections will be reset and applications will be restarted.');
        }
        else {
            warnings.push('Connections older than 30 minutes will be reset, and a temporary rotation username will be used during the process.');
        }
        if (force) {
            warnings.push(`Any followers lagging in replication (see ${color_1.default.cyan.bold('heroku pg:info')}) will be inaccessible until caught up.`);
        }
        if (attachments.length > 0) {
            const uniqueAttachments = [...new Set(attachments.map(attachment => color_1.default.app(attachment.app.name || '')))]
                .sort()
                .join(', ');
            warnings.push(`This command will affect the app${(attachments.length > 1) ? 's' : ''} ${uniqueAttachments}.`);
        }
        await (0, confirmCommand_1.default)(app, confirm, `Destructive Action\n${warnings.join('\n')}`);
        const options = {
            hostname: (0, host_1.default)(),
            body: { forced: force !== null && force !== void 0 ? force : undefined },
            headers: {
                Authorization: `Basic ${Buffer.from(`:${this.heroku.auth}`).toString('base64')}`,
            },
        };
        if (all) {
            core_1.ux.action.start(`Rotating all credentials on ${color_1.default.yellow(db.name)}`);
            await this.heroku.post(`/postgres/v0/databases/${db.name}/credentials_rotation`, options);
        }
        else {
            core_1.ux.action.start(`Rotating ${cred} on ${color_1.default.yellow(db.name)}`);
            await this.heroku.post(`/postgres/v0/databases/${db.name}/credentials/${encodeURIComponent(cred)}/credentials_rotation`, options);
        }
        core_1.ux.action.stop();
    }
}
exports.default = Rotate;
Rotate.topic = 'pg';
Rotate.description = 'rotate the database credentials';
Rotate.flags = {
    name: command_1.flags.string({
        char: 'n',
        description: 'which credential to rotate (default credentials if not specified and --all is not used)',
    }),
    all: command_1.flags.boolean({ description: 'rotate all credentials', exclusive: ['name'] }),
    confirm: command_1.flags.string({ char: 'c' }),
    force: command_1.flags.boolean({ description: 'forces rotating the targeted credentials' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Rotate.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
