"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Transfer extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Transfer);
        const space = flags.space;
        const team = flags.team;
        try {
            core_1.ux.action.start(`Transferring space ${color_1.default.yellow(space)} to team ${color_1.default.green(team)}`);
            await this.heroku.post(`/spaces/${space}/transfer`, { body: { new_owner: team } });
        }
        catch (error) {
            const { body: { message } } = error;
            core_1.ux.error(message);
        }
        finally {
            core_1.ux.action.stop();
        }
    }
}
exports.default = Transfer;
Transfer.topic = 'spaces';
Transfer.description = 'transfer a space to another team';
Transfer.examples = [(0, tsheredoc_1.default)(`
  $ heroku spaces:transfer --space=space-name --team=team-name
  Transferring space-name to team-name... done
  `)];
Transfer.flags = {
    space: command_1.flags.string({ required: true, char: 's', description: 'name of space' }),
    team: command_1.flags.string({ required: true, char: 't', description: 'desired owner of space' }),
};
