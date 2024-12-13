"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
class Remove extends command_1.Command {
    async run() {
        const { args } = await this.parse(Remove);
        core_1.ux.action.start(`Removing ${color_1.default.cyan(args.key)} SSH key`);
        const { body: keys } = await this.heroku.get('/account/keys');
        if (keys.length === 0) {
            throw new Error('No SSH keys on account');
        }
        const toRemove = keys.filter(k => k.comment === args.key);
        if (toRemove.length === 0) {
            throw new Error(`SSH Key ${color_1.default.red(args.key)} not found.
Found keys: ${color_1.default.yellow(keys.map(k => k.comment).join(', '))}.`);
        }
        await Promise.all(toRemove.map(key => this.heroku.delete(`/account/keys/${key.id}`)));
        core_1.ux.action.stop();
    }
}
exports.default = Remove;
Remove.description = 'remove an SSH key from the user';
Remove.example = `$ heroku keys:remove email@example.com
Removing email@example.com SSH key... done`;
Remove.args = {
    key: core_1.Args.string({ required: true, description: 'email address of the user' }),
};
