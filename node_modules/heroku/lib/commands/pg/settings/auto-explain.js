"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
const nls_1 = require("../../../nls");
// ref: https://www.postgresql.org/docs/current/auto-explain.html
class AutoExplain extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return 'Execution plans of queries will be logged for future connections.';
        }
        return 'Execution plans of queries will not be logged for future connections.';
    }
}
exports.default = AutoExplain;
AutoExplain.topic = 'pg';
AutoExplain.description = (0, tsheredoc_1.default)(`
  Automatically log execution plans of queries without running EXPLAIN by hand.
  The auto_explain module is loaded at session-time so existing connections will not be logged.
  Restart your Heroku app and/or restart existing connections for logging to start taking place.
  `);
AutoExplain.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
AutoExplain.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if execution plans of queries will be logged for future connections' }),
};
AutoExplain.strict = false;
