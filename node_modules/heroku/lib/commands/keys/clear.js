"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
class Clear extends command_1.Command {
    async run() {
        await this.parse(Clear);
        core_1.ux.action.start('Removing all SSH keys');
        const { body: keys } = await this.heroku.get('/account/keys');
        await Promise.all(keys.map(key => this.heroku.delete(`/account/keys/${key.id}`, {
            path: `/account/keys/${key.id}`,
        })));
        core_1.ux.action.stop();
    }
}
exports.default = Clear;
Clear.description = 'remove all SSH keys for current user';
