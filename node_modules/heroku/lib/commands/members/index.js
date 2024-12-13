"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const completions_1 = require("@heroku-cli/command/lib/completions");
const core_1 = require("@oclif/core");
const _ = require('lodash');
const buildTableColumns = (teamInvites) => {
    const baseColumns = {
        email: {
            get: ({ email }) => color_1.default.cyan(email),
        },
        role: {
            get: ({ role }) => color_1.default.green(role),
        },
    };
    if (teamInvites.length > 0) {
        return Object.assign(Object.assign({}, baseColumns), { status: {
                get: ({ status }) => color_1.default.green(status),
            } });
    }
    return baseColumns;
};
class MembersIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(MembersIndex);
        const { role, pending, json, team } = flags;
        const { body: teamInfo } = await this.heroku.get(`/teams/${team}`);
        let teamInvites = [];
        if (teamInfo.type === 'team') {
            const { body: orgFeatures } = await this.heroku.get(`/teams/${team}/features`);
            if (orgFeatures.some((feature => feature.name === 'team-invite-acceptance' && feature.enabled))) {
                const invitesResponse = await this.heroku.get(`/teams/${team}/invitations`, { headers: {
                        Accept: 'application/vnd.heroku+json; version=3.team-invitations',
                    },
                });
                teamInvites = _.map(invitesResponse.body, function (invite) {
                    var _a;
                    return { email: (_a = invite.user) === null || _a === void 0 ? void 0 : _a.email, role: invite.role, status: 'pending' };
                });
            }
        }
        let { body: members } = await this.heroku.get(`/teams/${team}/members`);
        // Set status '' to all existing members
        _.map(members, (member) => {
            member.status = '';
        });
        members = _.sortBy(_.union(members, teamInvites), 'email');
        if (role)
            members = members.filter(m => m.role === role);
        if (pending)
            members = members.filter(m => m.status === 'pending');
        if (json) {
            core_1.ux.log(JSON.stringify(members, null, 3));
        }
        else if (members.length === 0) {
            let msg = `No members in ${color_1.default.magenta(team || '')}`;
            if (role)
                msg += ` with role ${color_1.default.green(role)}`;
            core_1.ux.log(msg);
        }
        else {
            const tableColumns = buildTableColumns(teamInvites);
            core_1.ux.table(members, tableColumns);
        }
    }
}
exports.default = MembersIndex;
MembersIndex.topic = 'members';
MembersIndex.description = 'list members of a team';
MembersIndex.flags = {
    role: command_1.flags.string({ char: 'r', description: 'filter by role', completion: completions_1.RoleCompletion }),
    pending: command_1.flags.boolean({ description: 'filter by pending team invitations' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
    team: command_1.flags.team({ required: true }),
};
