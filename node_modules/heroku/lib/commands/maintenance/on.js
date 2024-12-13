"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
class MaintenanceOn extends command_1.Command {
    async run() {
        const { flags } = await this.parse(MaintenanceOn);
        core_1.ux.action.start(`Enabling maintenance mode for ${color_1.default.app(flags.app)}`);
        await this.heroku.patch(`/apps/${flags.app}`, { body: { maintenance: true } });
        core_1.ux.action.stop();
    }
}
exports.default = MaintenanceOn;
MaintenanceOn.description = 'put the app into maintenance mode';
MaintenanceOn.topic = 'maintenance';
MaintenanceOn.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
