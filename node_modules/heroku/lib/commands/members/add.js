"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const completions_1 = require("@heroku-cli/command/lib/completions");
const util_1 = require("../../lib/members/util");
class MembersAdd extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(MembersAdd);
        const { team, role } = flags;
        const { body: teamInfo } = await this.heroku.get(`/teams/${team}`);
        const email = args.email;
        const { body: groupFeatures } = await this.heroku.get(`/teams/${team}/features`);
        if (teamInfo.type === 'team' && groupFeatures.some(feature => {
            return feature.name === 'team-invite-acceptance' && feature.enabled;
        })) {
            await (0, util_1.inviteMemberToTeam)(email, role, team, this.heroku);
        }
        else {
            await (0, util_1.addMemberToTeam)(email, role, team, this.heroku);
        }
    }
}
exports.default = MembersAdd;
MembersAdd.topic = 'members';
MembersAdd.description = 'adds a user to a team';
MembersAdd.flags = {
    role: command_1.flags.string({ char: 'r', required: true, description: 'member role (admin, collaborator, member, owner)', completion: completions_1.RoleCompletion }),
    team: command_1.flags.team({ required: true }),
};
MembersAdd.args = {
    email: core_1.Args.string({ required: true, description: 'email address of the team member' }),
};
