"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const nls_1 = require("../../../nls");
class Index extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Index);
        const { app } = flags;
        const { database } = args;
        let dbs;
        if (database)
            dbs = await Promise.all([(0, fetcher_1.getAddon)(this.heroku, app, database)]);
        else
            dbs = await (0, fetcher_1.all)(this.heroku, app);
        if (dbs.length === 0)
            throw new Error(`No databases on ${color_1.default.app(app)}`);
        dbs = await Promise.all(dbs.map(async (db) => {
            const { body: links } = await this.heroku.get(`/client/v11/databases/${db.id}/links`, { hostname: (0, host_1.default)() });
            db.links = links;
            return db;
        }));
        let once;
        dbs.forEach(db => {
            if (once)
                core_1.ux.log();
            else
                once = true;
            core_1.ux.styledHeader(color_1.default.yellow(db.name));
            if (db.links.message)
                return core_1.ux.log(db.links.message);
            if (db.links.length === 0)
                return core_1.ux.log('No data sources are linked into this database');
            db.links.forEach((link) => {
                var _a, _b;
                core_1.ux.log(` * ${color_1.default.cyan(link.name)}`);
                const remoteAttachmentName = ((_a = link.remote) === null || _a === void 0 ? void 0 : _a.attachment_name) || '';
                const remoteName = ((_b = link.remote) === null || _b === void 0 ? void 0 : _b.name) || '';
                const remoteLinkText = `${color_1.default.green(remoteAttachmentName)} (${color_1.default.yellow(remoteName)})`;
                core_1.ux.styledObject({
                    created_at: link.created_at,
                    remote: remoteLinkText,
                });
            });
        });
    }
}
exports.default = Index;
Index.topic = 'pg';
Index.description = 'lists all databases and information on link';
Index.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Index.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
