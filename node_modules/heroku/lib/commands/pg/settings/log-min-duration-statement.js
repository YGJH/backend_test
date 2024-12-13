"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
const nls_1 = require("../../../nls");
class LogMinDurationStatement extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'log_min_duration_statement';
    }
    convertValue(val) {
        return val;
    }
    explain(setting) {
        if (setting.value === -1) {
            return 'The duration of each completed statement will not be logged.';
        }
        if (setting.value === 0) {
            return 'The duration of each completed statement will be logged.';
        }
        return `The duration of each completed statement will be logged if the statement ran for at least ${setting.value} milliseconds.`;
    }
}
exports.default = LogMinDurationStatement;
LogMinDurationStatement.description = (0, tsheredoc_1.default)(`
    The duration of each completed statement will be logged if the statement completes after the time specified by VALUE.
    VALUE needs to specified as a whole number, in milliseconds.
    Setting log_min_duration_statement to zero prints all statement durations and -1 will disable logging statement durations.
  `);
LogMinDurationStatement.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'milliseconds to wait for a statement to complete before logging it' }),
};
