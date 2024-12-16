"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
class Add extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Add);
        const { body: drain } = await this.heroku.post(`/apps/${flags.app}/log-drains`, {
            body: { url: args.url },
        });
        core_1.ux.log(`Successfully added drain ${color_1.default.cyan(drain.url || '')}`);
    }
}
exports.default = Add;
Add.description = 'adds a log drain to an app';
Add.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Add.args = {
    url: core_1.Args.string({ required: true, description: 'URL of the log drain' }),
};
