"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
const nls_1 = require("../../../nls");
class LogConnections extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'log_connections';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return 'When login attempts are made, a log message will be emitted in your application\'s logs.';
        }
        return 'When login attempts are made, no log message will be emitted in your application\'s logs.';
    }
}
exports.default = LogConnections;
LogConnections.topic = 'pg';
LogConnections.description = (0, tsheredoc_1.default)(`
  Controls whether a log message is produced when a login attempt is made. Default is true.
  Setting log_connections to false stops emitting log messages for all attempts to login to the database.`);
LogConnections.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
LogConnections.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if database login attempts get logged' }),
};
