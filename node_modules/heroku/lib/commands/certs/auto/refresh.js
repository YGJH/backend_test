"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Refresh extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Refresh);
        core_1.ux.action.start('Refreshing Automatic Certificate Management');
        await this.heroku.patch(`/apps/${flags.app}/acm`, { body: { acm_refresh: true } });
        core_1.ux.action.stop();
    }
}
exports.default = Refresh;
Refresh.topic = 'certs';
Refresh.description = 'refresh ACM for an app';
Refresh.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
