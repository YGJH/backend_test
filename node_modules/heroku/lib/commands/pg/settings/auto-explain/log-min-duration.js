"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../../lib/pg/setter");
const nls_1 = require("../../../../nls");
class LogMinDuration extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_min_duration';
    }
    convertValue(val) {
        return (0, setter_1.numericConverter)(val);
    }
    explain(setting) {
        if (setting.value === -1) {
            return 'Execution plan logging has been disabled.';
        }
        if (setting.value === 0) {
            return 'All queries will have their execution plans logged.';
        }
        return `All execution plans will be logged for queries taking up to ${setting.value} milliseconds or more.`;
    }
}
exports.default = LogMinDuration;
LogMinDuration.topic = 'pg';
LogMinDuration.description = (0, tsheredoc_1.default)(`
    Sets the minimum execution time in milliseconds for a statement's plan to be logged.
    Setting this value to 0 will log all queries. Setting this value to -1 will disable logging entirely.
  `);
LogMinDuration.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'minimum duration in milliseconds for queries before logging execution plans. A value of -1 disables it. A value of 0 logs all query execution plans.' }),
};
