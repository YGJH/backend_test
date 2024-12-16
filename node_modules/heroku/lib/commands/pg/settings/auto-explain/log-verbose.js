"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../../lib/pg/setter");
const nls_1 = require("../../../../nls");
class AutoExplainLogVerbose extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_verbose';
    }
    explain(setting) {
        if (setting.value) {
            return 'Verbose execution plan logging has been enabled for auto_explain.';
        }
        return 'Verbose execution plan logging has been disabled for auto_explain.';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
}
exports.default = AutoExplainLogVerbose;
AutoExplainLogVerbose.topic = 'pg';
AutoExplainLogVerbose.description = (0, tsheredoc_1.default)(`Include verbose details in execution plans.
    This is equivalent to calling EXPLAIN VERBOSE.`);
AutoExplainLogVerbose.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
AutoExplainLogVerbose.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if the database has verbose execution plan logging enabled' }),
};
