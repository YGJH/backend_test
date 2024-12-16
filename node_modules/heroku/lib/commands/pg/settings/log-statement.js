"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
const nls_1 = require("../../../nls");
class LogStatement extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'log_statement';
    }
    convertValue(val) {
        return val;
    }
    explain(setting) {
        return setting.values[setting.value];
    }
}
exports.default = LogStatement;
LogStatement.description = (0, tsheredoc_1.default)(`
    log_statement controls which SQL statements are logged.
    Valid values for VALUE:
    none - No statements are logged
    ddl  - All data definition statements, such as CREATE, ALTER and DROP will be logged
    mod  - Includes all statements from ddl as well as data-modifying statements such as INSERT, UPDATE, DELETE, TRUNCATE, COPY
    all  - All statements are logged
  `);
LogStatement.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ options: ['none', 'ddl', 'mod', 'all'], description: 'type of SQL statements to log\n<options: none|ddl|mod|all>' }),
};
