"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const setter_1 = require("../../../../lib/pg/setter");
const nls_1 = require("../../../../nls");
class LogNestedStatements extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_nested_statements';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return 'Nested statements will be included in execution plan logs.';
        }
        return 'Only top-level execution plans will be included in logs.';
    }
}
exports.default = LogNestedStatements;
LogNestedStatements.description = "Nested statements are included in the execution plan's log.";
LogNestedStatements.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if execution plan logs include nested statements' }),
};
