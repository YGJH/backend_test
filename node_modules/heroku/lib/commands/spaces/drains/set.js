"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Set extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Set);
        const { url } = args;
        const { space } = flags;
        const { body: drain } = await this.heroku.put(`/spaces/${space}/log-drain`, {
            body: { url },
            headers: { Accept: 'application/vnd.heroku+json; version=3.dogwood' },
        });
        core_1.ux.log(`Successfully set drain ${color_1.default.cyan(drain.url)} for ${color_1.default.cyan.bold(space)}.`);
        core_1.ux.warn('It may take a few moments for the changes to take effect.');
    }
}
exports.default = Set;
Set.topic = 'spaces';
Set.aliases = ['drains:set'];
Set.hidden = true;
Set.description = 'replaces the log drain for a space';
Set.flags = {
    space: command_1.flags.string({ char: 's', description: 'space for which to set log drain', required: true }),
};
Set.args = {
    url: core_1.Args.string({ required: true, description: 'URL to replace the log drain with' }),
};
