"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
class Disable extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Disable);
        const { app } = flags;
        const { feature } = args;
        core_1.ux.action.start(`Disabling ${color_1.default.green(feature)} for ${color_1.default.app(app)}`);
        const { body: f } = await this.heroku.get(`/apps/${app}/features/${feature}`);
        if (!f.enabled) {
            throw new Error(`${color_1.default.red(feature)} is already disabled.`);
        }
        await this.heroku.patch(`/apps/${app}/features/${feature}`, {
            body: { enabled: false },
        });
        core_1.ux.action.stop();
    }
}
exports.default = Disable;
Disable.description = 'disables an app feature';
Disable.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Disable.args = {
    feature: core_1.Args.string({ required: true, description: 'unique identifier or name of the app feature' }),
};
