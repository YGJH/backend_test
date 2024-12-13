"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Rename extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Rename);
        const { to, from } = flags;
        core_1.ux.action.start(`Renaming space from ${color_1.default.cyan(from)} to ${color_1.default.green(to)}`);
        await this.heroku.patch(`/spaces/${from}`, { body: { name: to } });
        core_1.ux.action.stop();
    }
}
exports.default = Rename;
Rename.topic = 'spaces';
Rename.description = 'renames a space';
Rename.example = (0, tsheredoc_1.default)(`
    $ heroku spaces:rename --from old-space-name --to new-space-name
    Renaming space old-space-name to new-space-name... done
  `);
Rename.flags = {
    from: command_1.flags.string({ required: true, description: 'current name of space' }),
    to: command_1.flags.string({ required: true, description: 'desired name of space' }),
};
