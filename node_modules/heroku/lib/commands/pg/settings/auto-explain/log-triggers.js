"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../../lib/pg/setter");
const nls_1 = require("../../../../nls");
class LogTriggers extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_triggers';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return 'Trigger execution statistics have been enabled for auto-explain.';
        }
        return 'Trigger execution statistics have been disabled for auto-explain.';
    }
}
exports.default = LogTriggers;
LogTriggers.topic = 'pg';
LogTriggers.description = (0, tsheredoc_1.default)(`
    Includes trigger execution statistics in execution plan logs.
    This parameter can only be used in conjunction with pg:settings:auto-explain:log-analyze turned on.
  `);
LogTriggers.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if the database has trigger execution statistics enabled' }),
};
