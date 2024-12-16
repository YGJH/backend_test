"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const completions_1 = require("@heroku-cli/command/lib/completions");
const utils_1 = require("../../lib/members/utils");
class MembersSet extends command_1.Command {
    async run() {
        const { flags, argv } = await this.parse(MembersSet);
        const { role, team } = flags;
        const email = argv[0];
        await (0, utils_1.addMemberToTeam)(email, role, team, this.heroku, 'PATCH');
    }
}
exports.default = MembersSet;
MembersSet.topic = 'members';
MembersSet.description = 'sets a members role in a team';
MembersSet.strict = false;
MembersSet.flags = {
    role: command_1.flags.string({ char: 'r', required: true, description: 'member role (admin, collaborator, member, owner)', completion: completions_1.RoleCompletion }),
    team: command_1.flags.team({ required: true }),
};
