"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const confirmCommand_1 = require("../../lib/confirmCommand");
const host_1 = require("../../lib/pg/host");
const fetcher_1 = require("../../lib/pg/fetcher");
const tsheredoc_1 = require("tsheredoc");
const nls_1 = require("../../nls");
class Reset extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Reset);
        const { app, confirm, extensions } = flags;
        const db = await (0, fetcher_1.getAddon)(this.heroku, app, args.database);
        let extensionsArray;
        if (extensions) {
            extensionsArray = extensions.split(',')
                .map(ext => ext.trim()
                .toLowerCase())
                .sort();
        }
        await (0, confirmCommand_1.default)(app, confirm, (0, tsheredoc_1.default)(`
      Destructive action
      ${color_1.default.addon(db.name)} will lose all of its data
    `));
        core_1.ux.action.start(`Resetting ${color_1.default.addon(db.name)}`);
        await this.heroku.put(`/client/v11/databases/${db.id}/reset`, {
            body: { extensions: extensionsArray }, hostname: (0, host_1.default)(),
        });
        core_1.ux.action.stop();
    }
}
exports.default = Reset;
Reset.topic = 'pg';
Reset.description = 'delete all data in DATABASE';
Reset.flags = {
    extensions: command_1.flags.string({ char: 'e', description: 'comma-separated list of extensions to pre-install in the public schema' }),
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Reset.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
};
