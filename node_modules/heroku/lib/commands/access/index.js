"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const api_client_1 = require("@heroku-cli/command/lib/api-client");
const core_1 = require("@oclif/core");
const _ = require("lodash");
const teamUtils_1 = require("../../lib/teamUtils");
function printJSON(collaborators) {
    core_1.ux.log(JSON.stringify(collaborators, null, 2));
}
function buildTableColumns(showPermissions) {
    const baseColumns = {
        email: {
            get: ({ email }) => color_1.default.cyan(email),
        },
        role: {
            get: ({ role }) => color_1.default.green(role),
        },
    };
    if (showPermissions) {
        return Object.assign(Object.assign({}, baseColumns), { permissions: {} });
    }
    return baseColumns;
}
function printAccess(app, collaborators) {
    var _a;
    const showPermissions = (0, teamUtils_1.isTeamApp)((_a = app.owner) === null || _a === void 0 ? void 0 : _a.email);
    collaborators = _.chain(collaborators)
        .sortBy(c => c.email || c.user.email)
        .reject(c => /herokumanager\.com$/.test(c.user.email))
        .map(collab => {
        const email = collab.user.email;
        const role = collab.role;
        const data = { email: email, role: role || 'collaborator' };
        if (showPermissions) {
            data.permissions = _.map(_.sortBy(collab.permissions, 'name'), 'name').join(', ');
        }
        return data;
    })
        .value();
    const tableColumns = buildTableColumns(showPermissions);
    core_1.ux.table(collaborators, tableColumns);
}
function buildCollaboratorsArray(collaboratorsRaw, admins) {
    const collaboratorsNoAdmins = _.reject(collaboratorsRaw, { role: 'admin' });
    return _.union(collaboratorsNoAdmins, admins);
}
class AccessIndex extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags } = await this.parse(AccessIndex);
        const { app: appName, json } = flags;
        const { body: app } = await this.heroku.get(`/apps/${appName}`);
        let { body: collaborators } = await this.heroku.get(`/apps/${appName}/collaborators`);
        if ((0, teamUtils_1.isTeamApp)((_a = app.owner) === null || _a === void 0 ? void 0 : _a.email)) {
            const teamName = (0, teamUtils_1.getOwner)((_b = app.owner) === null || _b === void 0 ? void 0 : _b.email);
            try {
                const { body: members } = await this.heroku.get(`/teams/${teamName}/members`);
                let admins = members.filter(member => member.role === 'admin');
                const { body: adminPermissions } = await this.heroku.get('/teams/permissions');
                admins = _.forEach(admins, function (admin) {
                    admin.user = { email: admin.email };
                    admin.permissions = adminPermissions;
                    return admin;
                });
                collaborators = buildCollaboratorsArray(collaborators, admins);
            }
            catch (error) {
                if (!(error instanceof api_client_1.HerokuAPIError && error.http.statusCode === 403))
                    throw error;
            }
        }
        if (json)
            printJSON(collaborators);
        else
            printAccess(app, collaborators);
    }
}
exports.default = AccessIndex;
AccessIndex.description = 'list who has access to an app';
AccessIndex.topic = 'access';
AccessIndex.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote({ char: 'r' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
