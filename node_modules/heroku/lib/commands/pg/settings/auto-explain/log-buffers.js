"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../../lib/pg/setter");
const nls_1 = require("../../../../nls");
class LogBuffersWaits extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_buffers';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return 'Buffer statistics have been enabled for auto_explain.';
        }
        return 'Buffer statistics have been disabled for auto_explain.';
    }
}
exports.default = LogBuffersWaits;
LogBuffersWaits.topic = 'pg';
LogBuffersWaits.description = (0, tsheredoc_1.default)(`
    Includes buffer usage statistics when execution plans are logged.
    This is equivalent to calling EXPLAIN BUFFERS and can only be used in conjunction with pg:settings:auto-explain:log-analyze turned on.
  `);
LogBuffersWaits.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if the database has buffer statistics enabled' }),
};
