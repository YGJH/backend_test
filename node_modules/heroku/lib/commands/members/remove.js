"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const revokeInvite = async (email, team, heroku) => {
    core_1.ux.action.start(`Revoking invite for ${color_1.default.cyan(email)} in ${color_1.default.magenta(team)}`);
    await heroku.delete(`/teams/${team}/invitations/${email}`, {
        headers: {
            Accept: 'application/vnd.heroku+json; version=3.team-invitations',
        },
    });
    core_1.ux.action.stop();
};
const getTeamInvites = async (team, heroku) => {
    const { body: teamInvites } = await heroku.get(`/teams/${team}/invitations`, {
        headers: {
            Accept: 'application/vnd.heroku+json; version=3.team-invitations',
        },
    });
    return teamInvites;
};
const removeUserMembership = async (email, team, heroku) => {
    core_1.ux.action.start(`Removing ${color_1.default.cyan(email)} from ${color_1.default.magenta(team)}`);
    await heroku.delete(`/teams/${team}/members/${encodeURIComponent(email)}`);
    core_1.ux.action.stop();
};
class MembersRemove extends command_1.Command {
    async run() {
        const { flags, argv } = await this.parse(MembersRemove);
        const { team } = flags;
        const email = argv[0];
        const { body: teamInfo } = await this.heroku.get(`/teams/${team}`);
        let teamInviteFeatureEnabled = false;
        let isInvitedUser = false;
        if (teamInfo.type === 'team') {
            const { body: teamFeatures } = await this.heroku.get(`/teams/${team}/features`);
            teamInviteFeatureEnabled = Boolean(teamFeatures.some(feature => feature.name === 'team-invite-acceptance' && feature.enabled));
            if (teamInviteFeatureEnabled) {
                const invites = await getTeamInvites(team, this.heroku);
                isInvitedUser = Boolean(invites.some(m => { var _a; return ((_a = m.user) === null || _a === void 0 ? void 0 : _a.email) === email; }));
            }
        }
        if (teamInviteFeatureEnabled && isInvitedUser) {
            await revokeInvite(email, team, this.heroku);
        }
        else {
            await removeUserMembership(email, team, this.heroku);
        }
    }
}
exports.default = MembersRemove;
MembersRemove.topic = 'members';
MembersRemove.description = 'removes a user from a team';
MembersRemove.flags = {
    team: command_1.flags.team({ required: true }),
};
MembersRemove.strict = false;
