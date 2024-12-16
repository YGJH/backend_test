"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class AppsJoin extends command_1.Command {
    async run() {
        const { flags } = await this.parse(AppsJoin);
        const { app } = flags;
        core_1.ux.action.start(`Joining ${color_1.default.cyan(app)}`);
        const { body: user } = await this.heroku.get('/account');
        await this.heroku.post(`/teams/apps/${app}/collaborators`, {
            body: { user: user.email },
        });
        core_1.ux.action.stop();
    }
}
exports.default = AppsJoin;
AppsJoin.topic = 'apps';
AppsJoin.description = 'add yourself to a team app';
AppsJoin.aliases = ['join'];
AppsJoin.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote({ char: 'r' }),
};
