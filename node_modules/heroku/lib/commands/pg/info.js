"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../lib/pg/host");
const fetcher_1 = require("../../lib/pg/fetcher");
const util_1 = require("../../lib/pg/util");
const nls_1 = require("../../nls");
function displayDB(db, app) {
    var _a, _b, _c, _d, _e;
    if (db.addon.attachment_names) {
        core_1.ux.styledHeader(db.addon.attachment_names.map((c) => color_1.default.green(c + '_URL'))
            .join(', '));
    }
    else {
        core_1.ux.styledHeader(((_a = db.configVars) === null || _a === void 0 ? void 0 : _a.map(c => color_1.default.green(c)).join(', ')) || '');
    }
    if (db.addon.app.name && db.addon.app.name !== app) {
        (_b = db.dbInfo) === null || _b === void 0 ? void 0 : _b.info.push({ name: 'Billing App', values: [color_1.default.cyan(db.addon.app.name)] });
    }
    (_c = db.dbInfo) === null || _c === void 0 ? void 0 : _c.info.push({ name: 'Add-on', values: [color_1.default.yellow(db.addon.name)] });
    const info = {};
    (_d = db.dbInfo) === null || _d === void 0 ? void 0 : _d.info.forEach(infoObject => {
        if (infoObject.values.length > 0) {
            let valuesArray;
            if (infoObject.resolve_db_name) {
                valuesArray = infoObject.values.map(v => (0, util_1.databaseNameFromUrl)(v, db.config));
            }
            else {
                valuesArray = infoObject.values;
            }
            info[infoObject.name] = valuesArray.join(', ');
        }
    });
    const keys = (_e = db.dbInfo) === null || _e === void 0 ? void 0 : _e.info.map(i => i.name);
    core_1.ux.styledObject(info, keys);
    core_1.ux.log();
}
class Info extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Info);
        const { app } = flags;
        const { sortBy } = require('lodash');
        const { database: db } = args;
        let addons;
        const { body: config } = await this.heroku.get(`/apps/${app}/config-vars`);
        if (db) {
            addons = await Promise.all([(0, fetcher_1.getAddon)(this.heroku, app, db)]);
        }
        else {
            addons = await (0, fetcher_1.all)(this.heroku, app);
            if (addons.length === 0) {
                core_1.ux.log(`${color_1.default.magenta(app)} has no heroku-postgresql databases.`);
                return;
            }
        }
        let dbs = await Promise.all(addons.map(async (addon) => {
            const pgResponse = await this.heroku.get(`/client/v11/databases/${addon.id}`, {
                hostname: (0, host_1.default)(),
            })
                .catch(error => {
                if (error.statusCode !== 404)
                    throw error;
                core_1.ux.warn(`${color_1.default.yellow(addon.name)} is not yet provisioned.\nRun ${color_1.default.cyan.bold('heroku addons:wait')} to wait until the db is provisioned.`);
            });
            const { body: dbInfo } = pgResponse || { body: null };
            return {
                addon,
                config,
                dbInfo,
            };
        }));
        dbs = dbs.filter(db => db.dbInfo);
        dbs.forEach(db => {
            var _a;
            db.configVars = (0, util_1.configVarNamesFromValue)(db.config, ((_a = db.dbInfo) === null || _a === void 0 ? void 0 : _a.resource_url) || '');
        });
        dbs = sortBy(dbs, (db) => db.configVars && db.configVars[0] !== 'DATABASE_URL', 'configVars[0]');
        dbs.forEach(db => displayDB(db, app));
    }
}
exports.default = Info;
Info.topic = 'pg';
Info.description = 'show database information';
Info.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Info.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:all-dbs:suffix')}` }),
};
Info.aliases = ['pg'];
