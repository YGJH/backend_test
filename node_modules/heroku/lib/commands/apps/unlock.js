"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Unlock extends command_1.Command {
    async run() {
        var _a;
        const { flags } = await this.parse(Unlock);
        const { app } = flags;
        const { body: appResponse } = await this.heroku.get(`/teams/apps/${app}`);
        const appName = (_a = appResponse.name) !== null && _a !== void 0 ? _a : app;
        if (!appResponse.locked) {
            core_1.ux.error(`cannot unlock ${color_1.default.cyan(appName)}\nThis app is not locked.`, { exit: 1 });
        }
        core_1.ux.action.start(`Unlocking ${color_1.default.cyan(appName)}`);
        await this.heroku.patch(`/teams/apps/${appName}`, {
            body: { locked: false },
        });
        core_1.ux.action.stop();
    }
}
exports.default = Unlock;
Unlock.topic = 'apps';
Unlock.description = 'unlock an app so any team member can join';
Unlock.aliases = ['unlock'];
Unlock.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
