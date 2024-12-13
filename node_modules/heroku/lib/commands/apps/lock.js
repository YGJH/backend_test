"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class AppsLock extends command_1.Command {
    async run() {
        var _a;
        const { flags } = await this.parse(AppsLock);
        const { app } = flags;
        const { body: appResponse } = await this.heroku.get(`/teams/apps/${app}`);
        const appName = (_a = appResponse.name) !== null && _a !== void 0 ? _a : app;
        if (appResponse.locked) {
            throw new Error(`Error: cannot lock ${color_1.default.cyan(appName)}.\nThis app is already locked.`);
        }
        core_1.ux.action.start(`Locking ${color_1.default.cyan(appName)}`);
        await this.heroku.patch(`/teams/apps/${appName}`, {
            body: { locked: true },
        });
        core_1.ux.action.stop();
    }
}
exports.default = AppsLock;
AppsLock.topic = 'apps';
AppsLock.description = 'prevent team members from joining an app';
AppsLock.aliases = ['lock'];
AppsLock.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
