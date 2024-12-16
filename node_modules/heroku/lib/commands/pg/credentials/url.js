"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../../lib/pg/util");
const fetcher_1 = require("../../../lib/pg/fetcher");
const host_1 = require("../../../lib/pg/host");
const url_1 = require("url");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../../nls");
class Url extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Url);
        const { app, name } = flags;
        const { database } = args;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        if ((0, util_1.legacyEssentialPlan)(db) && name !== 'default') {
            core_1.ux.error('Legacy Essential-tier databases do not support named credentials.');
        }
        const { body: credInfo } = await this.heroku.get(`/postgres/v0/databases/${db.name}/credentials/${encodeURIComponent(name)}`, {
            hostname: (0, host_1.default)(),
            headers: {
                Authorization: `Basic ${Buffer.from(`:${this.heroku.auth}`).toString('base64')}`,
            },
        });
        const activeCreds = credInfo.credentials.find(c => c.state === 'active');
        if (!activeCreds) {
            core_1.ux.error(`Could not find any active credentials for ${name}`, { exit: 1 });
        }
        const creds = Object.assign({}, db, {
            database: credInfo.database, host: credInfo.host, port: credInfo.port,
        }, {
            user: activeCreds === null || activeCreds === void 0 ? void 0 : activeCreds.user, password: activeCreds === null || activeCreds === void 0 ? void 0 : activeCreds.password,
        });
        const connUrl = new url_1.URL(`postgres://${creds.host}/${creds.database}`);
        connUrl.port = creds.port.toString();
        if (creds.user && creds.password) {
            connUrl.username = creds.user;
            connUrl.password = creds.password;
        }
        core_1.ux.log((0, tsheredoc_1.default)(`
      Connection information for ${color_1.default.yellow(name)} credential.
      Connection info string:
        "dbname=${creds.database} host=${creds.host} port=${creds.port} user=${creds.user} password=${creds.password} sslmode=require"
      Connection URL:
        ${connUrl}
    `));
    }
}
exports.default = Url;
Url.topic = 'pg';
Url.description = 'show information on a database credential';
Url.flags = {
    name: command_1.flags.string({
        char: 'n',
        description: 'which credential to show (default credentials if not specified)',
        default: 'default',
    }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Url.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
