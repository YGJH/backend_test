"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/api");
class PipelinesRemove extends command_1.Command {
    async run() {
        const { flags: { app } } = await this.parse(PipelinesRemove);
        core_1.ux.action.start(`Removing ${color_1.default.app(app)}`);
        await (0, api_1.removeCoupling)(this.heroku, app);
        core_1.ux.action.stop();
    }
}
exports.default = PipelinesRemove;
PipelinesRemove.description = 'remove this app from its pipeline';
PipelinesRemove.examples = [
    '$ heroku pipelines:remove -a my-app',
];
PipelinesRemove.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
