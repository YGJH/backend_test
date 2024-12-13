"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class AccessRemove extends command_1.Command {
    async run() {
        const { flags, argv } = await this.parse(AccessRemove);
        const { app } = flags;
        const email = argv[0];
        const appName = app;
        core_1.ux.action.start(`Removing ${color_1.default.cyan(email)} access from the app ${color_1.default.magenta(appName)}`);
        await this.heroku.delete(`/apps/${appName}/collaborators/${email}`);
        core_1.ux.action.stop();
    }
}
exports.default = AccessRemove;
AccessRemove.description = 'remove users from a team app';
AccessRemove.example = '$ heroku access:remove user@email.com --app APP';
AccessRemove.topic = 'access';
AccessRemove.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote({ char: 'r' }),
};
AccessRemove.strict = false;
