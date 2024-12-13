"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../../lib/pg/setter");
const nls_1 = require("../../../../nls");
class LogAnalyze extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_analyze';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return 'EXPLAIN ANALYZE execution plans will be logged.';
        }
        return 'EXPLAIN ANALYZE execution plans will not be logged.';
    }
}
exports.default = LogAnalyze;
LogAnalyze.topic = 'pg';
LogAnalyze.description = (0, tsheredoc_1.default)(`
    Shows actual run times on the execution plan.
    This is equivalent to calling EXPLAIN ANALYZE.

    WARNING: EXPLAIN ANALYZE will be run on ALL queries, not just logged queries. This can cause significant performance impacts to your database and should be used with caution.
  `);
LogAnalyze.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if execution plans get logged' }),
};
