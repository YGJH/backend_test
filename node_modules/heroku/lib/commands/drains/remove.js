"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Remove extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Remove);
        const { body: drain } = await this.heroku.delete(`/apps/${flags.app}/log-drains/${encodeURIComponent(args.url)}`);
        core_1.ux.log(`Successfully removed drain ${color_1.default.cyan(drain.url || '')}`);
    }
}
exports.default = Remove;
Remove.description = 'removes a log drain from an app';
Remove.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Remove.example = 'drains:remove [URL|TOKEN]';
Remove.args = {
    url: core_1.Args.string({ required: true, description: 'URL of the log drain' }),
};
