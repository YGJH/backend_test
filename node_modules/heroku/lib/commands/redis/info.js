"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
class Info extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Info);
        const { app, json } = flags;
        const { database } = args;
        return (0, api_1.default)(app, database, json, this.heroku).info();
    }
}
exports.default = Info;
Info.topic = 'redis';
Info.description = 'gets information about redis';
Info.aliases = ['redis'];
Info.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
};
Info.args = {
    database: core_1.Args.string({ description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
