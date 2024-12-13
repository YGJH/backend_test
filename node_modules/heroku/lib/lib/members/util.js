"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMemberToTeam = exports.inviteMemberToTeam = void 0;
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const inviteMemberToTeam = async function (email, role, team, heroku) {
    core_1.ux.action.start(`Inviting ${color_1.default.cyan(email)} to ${color_1.default.magenta(team)} as ${color_1.default.green(role)}`);
    await heroku.request(`/teams/${team}/invitations`, {
        headers: {
            Accept: 'application/vnd.heroku+json; version=3.team-invitations',
        }, method: 'PUT',
        body: { email, role },
    });
    core_1.ux.action.stop();
};
exports.inviteMemberToTeam = inviteMemberToTeam;
const addMemberToTeam = async function (email, role, groupName, heroku, method = 'PUT') {
    core_1.ux.action.start(`Adding ${color_1.default.cyan(email)} to ${color_1.default.magenta(groupName)} as ${color_1.default.green(role)}`);
    await heroku.request(`/teams/${groupName}/members`, {
        method: method,
        body: { email, role },
    });
    core_1.ux.action.stop();
};
exports.addMemberToTeam = addMemberToTeam;
