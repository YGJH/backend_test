"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const fetcher_1 = require("../../lib/pg/fetcher");
const psql_1 = require("../../lib/pg/psql");
const nls_1 = require("../../nls");
class Psql extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Psql);
        const { app, command, credential, file } = flags;
        const namespace = credential ? `credential:${credential}` : undefined;
        let db;
        try {
            db = await (0, fetcher_1.database)(this.heroku, app, args.database, namespace);
        }
        catch (error) {
            if (namespace && error instanceof Error && error.message === "Couldn't find that addon.") {
                throw new Error("Credential doesn't match, make sure credential is attached");
            }
            throw error;
        }
        console.error(`--> Connecting to ${color_1.default.yellow(db.attachment.addon.name)}`);
        if (command) {
            const output = await (0, psql_1.exec)(db, command);
            process.stdout.write(output);
        }
        else if (file) {
            const output = await (0, psql_1.execFile)(db, file);
            process.stdout.write(output);
        }
        else {
            await (0, psql_1.interactive)(db);
        }
    }
}
exports.default = Psql;
Psql.description = 'open a psql shell to the database';
Psql.flags = {
    command: command_1.flags.string({ char: 'c', description: 'SQL command to run' }),
    file: command_1.flags.string({ char: 'f', description: 'SQL file to run' }),
    credential: command_1.flags.string({ description: 'credential to use' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Psql.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
Psql.aliases = ['psql'];
