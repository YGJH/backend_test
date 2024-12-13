"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Leave extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Leave);
        const { app } = flags;
        const request = await this.heroku.get('/account');
        core_1.ux.action.start(`Leaving ${color_1.default.cyan(app)}`);
        const { body: account } = request;
        await this.heroku.delete(`/apps/${app}/collaborators/${encodeURIComponent(account.email)}`);
        core_1.ux.action.stop();
    }
}
exports.default = Leave;
Leave.topic = 'apps';
Leave.aliases = ['leave'];
Leave.description = 'remove yourself from a team app';
Leave.example = 'heroku apps:leave -a APP';
Leave.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
