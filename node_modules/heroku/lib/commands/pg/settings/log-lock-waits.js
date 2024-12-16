"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
const nls_1 = require("../../../nls");
class LogLockWaits extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'log_lock_waits';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting.value) {
            return "When a deadlock is detected, a log message will be emitted in your application's logs.";
        }
        return "When a deadlock is detected, no log message will be emitted in your application's logs.";
    }
}
exports.default = LogLockWaits;
LogLockWaits.topic = 'pg';
LogLockWaits.description = (0, tsheredoc_1.default)(`
    Controls whether a log message is produced when a session waits longer than the deadlock_timeout to acquire a lock. deadlock_timeout is set to 1 second
    Delays due to lock contention occur when multiple transactions are trying to access the same resource at the same time.
    Applications and their query patterns should try to avoid changes to many different tables within the same transaction.
  `);
LogLockWaits.args = {
    database: core_1.Args.string({ description: `${(0, nls_1.nls)('pg:database:arg:description')} ${(0, nls_1.nls)('pg:database:arg:description:default:suffix')}` }),
    value: core_1.Args.string({ description: 'boolean indicating if a message gets logged when a session waits longer than the deadlock_timeout to acquire a lock' }),
};
