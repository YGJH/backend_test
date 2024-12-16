"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
const nls_1 = require("../../../nls");
class LogMinErrorStatement extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'log_min_error_statement';
    }
    convertValue(val) {
        return val;
    }
    explain(setting) {
        return setting.values[setting.value];
    }
}
exports.default = LogMinErrorStatement;
LogMinErrorStatement.description = (0, tsheredoc_1.default)(`
    log-min-error-statement controls the logging of SQL statements that cause an error at a specified severity level.
    This setting is useful to prevent logging SQL queries that might contain sensitive information.
    Use this setting to prevent logging SQL queries that contain sensitive information. Default is "error".
  `);
LogMinErrorStatement.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ options: ['error', 'log', 'fatal', 'panic'] }),
};
