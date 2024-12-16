"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../lib/pg/host");
const backups_1 = require("../../lib/pg/backups");
const fetcher_1 = require("../../lib/pg/fetcher");
const util_1 = require("../../lib/pg/util");
const confirmCommand_1 = require("../../lib/confirmCommand");
const getAttachmentInfo = async function (heroku, db, app) {
    if (db.match(/^postgres:\/\//)) {
        const conn = (0, util_1.parsePostgresConnectionString)(db);
        const host = `${conn.host}:${conn.port}`;
        return {
            name: conn.database ? `database ${conn.database} on ${host}` : `database on ${host}`,
            url: db,
            confirm: conn.database || conn.host,
        };
    }
    const attachment = await (0, fetcher_1.getAttachment)(heroku, app, db);
    if (!attachment)
        throw new Error(`${db} not found on ${color_1.default.magenta(app)}`);
    const { body: addon } = await heroku.get(`/addons/${attachment.addon.name}`);
    const { body: config } = await heroku.get(`/apps/${attachment.app.name}/config-vars`);
    const formattedConfig = Object.fromEntries(Object.entries(config).map(([k, v]) => [k.toUpperCase(), v]));
    return {
        name: attachment.name.replace(/^HEROKU_POSTGRESQL_/, '')
            .replace(/_URL$/, ''),
        url: formattedConfig[attachment.name.toUpperCase() + '_URL'],
        attachment: Object.assign(Object.assign({}, attachment), { addon }),
        confirm: app,
    };
};
class Copy extends command_1.Command {
    async run() {
        var _a;
        const { flags, args } = await this.parse(Copy);
        const { 'wait-interval': waitInterval, verbose, confirm, app } = flags;
        const pgbackups = (0, backups_1.default)(app, this.heroku);
        const interval = Math.max(3, Number.parseInt(waitInterval || '0', 10)) || 3;
        const [source, target] = await Promise.all([getAttachmentInfo(this.heroku, args.source, app), getAttachmentInfo(this.heroku, args.target, app)]);
        if (source.url === target.url)
            throw new Error('Cannot copy database onto itself');
        await (0, confirmCommand_1.default)(target.confirm || args.target, confirm, `WARNING: Destructive action\nThis command will remove all data from ${color_1.default.yellow(target.name)}\nData from ${color_1.default.yellow(source.name)} will then be transferred to ${color_1.default.yellow(target.name)}`);
        core_1.ux.action.start(`Starting copy of ${color_1.default.yellow(source.name)} to ${color_1.default.yellow(target.name)}`);
        const attachment = target.attachment || source.attachment;
        if (!attachment) {
            throw new Error('Heroku PostgreSQL database must be source or target');
        }
        const { body: copy } = await this.heroku.post(`/client/v11/databases/${attachment.addon.id}/transfers`, {
            body: {
                from_name: source.name, from_url: source.url, to_name: target.name, to_url: target.url,
            },
            hostname: (0, host_1.default)(),
        });
        core_1.ux.action.stop();
        if (source.attachment) {
            const { body: credentials } = await this.heroku.get(`/postgres/v0/databases/${source.attachment.addon.name}/credentials`, {
                hostname: (0, host_1.default)(),
                headers: {
                    Authorization: `Basic ${Buffer.from(`:${this.heroku.auth}`).toString('base64')}`,
                },
            });
            if (credentials.length > 1) {
                core_1.ux.warn('pg:copy will only copy your default credential and the data it has access to. Any additional credentials and data that only they can access will not be copied.');
            }
        }
        await pgbackups.wait('Copying', copy.uuid, interval, verbose, ((_a = attachment.addon.app) === null || _a === void 0 ? void 0 : _a.name) || app);
    }
}
exports.default = Copy;
Copy.topic = 'pg';
Copy.description = 'copy all data from source db to target';
Copy.help = 'at least one of the databases must be a Heroku PostgreSQL DB';
Copy.flags = {
    'wait-interval': command_1.flags.string(),
    verbose: command_1.flags.boolean(),
    confirm: command_1.flags.string(),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Copy.args = {
    source: core_1.Args.string({ required: true, description: 'config var exposed to the owning app containing the source database URL' }),
    target: core_1.Args.string({ required: true, description: 'config var exposed to the owning app containing the target database URL' }),
};
