"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class MaintenanceIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(MaintenanceIndex);
        const appResponse = await this.heroku.get(`/apps/${flags.app}`);
        const app = appResponse.body;
        core_1.ux.log(app.maintenance ? 'on' : 'off');
    }
}
exports.default = MaintenanceIndex;
MaintenanceIndex.description = 'display the current maintenance status of app';
MaintenanceIndex.topic = 'maintenance';
MaintenanceIndex.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
