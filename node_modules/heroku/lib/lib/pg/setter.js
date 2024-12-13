"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numericConverter = exports.booleanConverter = exports.PGSettingsCommand = void 0;
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const resolve_1 = require("../addons/resolve");
const host_1 = require("./host");
const util_1 = require("./util");
class PGSettingsCommand extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse();
        const { app } = flags;
        const { value, database } = args;
        const db = await (0, resolve_1.addonResolver)(this.heroku, app, database || 'DATABASE_URL');
        if ((0, util_1.essentialPlan)(db))
            core_1.ux.error('You can’t perform this operation on Essential-tier databases.');
        if (value) {
            const { body: settings } = await this.heroku.patch(`/postgres/v0/databases/${db.id}/config`, {
                hostname: (0, host_1.default)(),
                body: { [this.settingKey]: this.convertValue(value) },
            });
            const setting = settings[this.settingKey];
            core_1.ux.log(`${this.settingKey.replace(/_/g, '-')} has been set to ${setting.value} for ${db.name}.`);
            core_1.ux.log(this.explain(setting));
        }
        else {
            const { body: settings } = await this.heroku.get(`/postgres/v0/databases/${db.id}/config`, { hostname: (0, host_1.default)() });
            const setting = settings[this.settingKey];
            core_1.ux.log(`${this.settingKey.replace(/_/g, '-')} is set to ${setting.value} for ${db.name}.`);
            core_1.ux.log(this.explain(setting));
        }
    }
}
exports.PGSettingsCommand = PGSettingsCommand;
PGSettingsCommand.topic = 'pg';
PGSettingsCommand.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
const booleanConverter = (value) => {
    switch (value) {
        case 'true':
        case 'TRUE':
        case 'ON':
        case 'on':
            return true;
        case 'false':
        case 'FALSE':
        case 'OFF':
        case 'off':
        case null:
            return false;
        default:
            throw new TypeError('Invalid value. Valid options are: a boolean value');
    }
};
exports.booleanConverter = booleanConverter;
const numericConverter = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        throw new TypeError('Invalid value. Valid options are: a numeric value');
    }
    return n;
};
exports.numericConverter = numericConverter;
