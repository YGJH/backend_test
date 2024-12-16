"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
class MaintenanceOff extends command_1.Command {
    async run() {
        const { flags } = await this.parse(MaintenanceOff);
        core_1.ux.action.start(`Disabling maintenance mode for ${color_1.default.app(flags.app)}`);
        await this.heroku.patch(`/apps/${flags.app}`, { body: { maintenance: false } });
        core_1.ux.action.stop();
    }
}
exports.default = MaintenanceOff;
MaintenanceOff.description = 'take the app out of maintenance mode';
MaintenanceOff.topic = 'maintenance';
MaintenanceOff.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
