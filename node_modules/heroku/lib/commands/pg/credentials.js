"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const host_1 = require("../../lib/pg/host");
const fetcher_1 = require("../../lib/pg/fetcher");
const util_1 = require("../../lib/pg/util");
const nls_1 = require("../../nls");
class Credentials extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Credentials);
        const { app } = flags;
        const { database } = args;
        const addon = await (0, fetcher_1.getAddon)(this.heroku, app, database);
        const { body: credentials } = await this.heroku.get(`/postgres/v0/databases/${addon.id}/credentials`, {
            hostname: (0, host_1.default)(),
            headers: {
                Authorization: `Basic ${Buffer.from(`:${this.heroku.auth}`).toString('base64')}`,
            },
        });
        const sortedCredentials = this.sortByDefaultAndName(credentials);
        const { body: attachments } = await this.heroku.get(`/addons/${addon.id}/addon-attachments`);
        const presentCredential = (cred) => {
            let credAttachments = [];
            if (cred.name === 'default') {
                credAttachments = attachments.filter(a => a.namespace === null);
            }
            else {
                credAttachments = attachments.filter(a => a.namespace === `credential:${cred.name}`);
            }
            return (0, util_1.presentCredentialAttachments)(app, credAttachments, sortedCredentials, cred.name);
        };
        core_1.ux.table(credentials, {
            Credential: {
                get: presentCredential,
            },
            State: {
                get: cred => cred.state,
            },
        });
    }
    sortByDefaultAndName(credentials) {
        return credentials.sort((a, b) => {
            const isDefaultA = this.isDefaultCredential(a);
            const isDefaultB = this.isDefaultCredential(b);
            return isDefaultB < isDefaultA ? -1 : (isDefaultA < isDefaultB ? 1 : a.name.localeCompare(b.name));
        });
    }
    isDefaultCredential(cred) {
        return cred.name === 'default';
    }
}
exports.default = Credentials;
Credentials.topic = 'pg';
Credentials.description = 'show information on credentials in the database';
Credentials.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Credentials.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
