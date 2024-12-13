"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const teamUtils_1 = require("../../lib/teamUtils");
const _ = require("lodash");
class AccessAdd extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags, args } = await this.parse(AccessAdd);
        const { email } = args;
        const { app: appName, permissions } = flags;
        const { body: appInfo } = await this.heroku.get(`/apps/${appName}`);
        let output = `Adding ${color_1.default.cyan(email)} access to the app ${color_1.default.magenta(appName)}`;
        let teamFeatures = [];
        if ((0, teamUtils_1.isTeamApp)((_a = appInfo === null || appInfo === void 0 ? void 0 : appInfo.owner) === null || _a === void 0 ? void 0 : _a.email)) {
            const teamName = (0, teamUtils_1.getOwner)((_b = appInfo === null || appInfo === void 0 ? void 0 : appInfo.owner) === null || _b === void 0 ? void 0 : _b.email);
            const teamFeaturesRequest = await this.heroku.get(`/teams/${teamName}/features`);
            teamFeatures = teamFeaturesRequest.body;
        }
        if (teamFeatures.some(feature => feature.name === 'org-access-controls')) {
            if (!permissions)
                this.error('Missing argument: permissions', { exit: 1 });
            const permissionsArray = permissions ? permissions.split(',') : [];
            permissionsArray.push('view');
            const permissionsArraySorted = _.uniq(permissionsArray.sort());
            output += ` with ${color_1.default.green(permissionsArraySorted.join(', '))} permissions`;
            core_1.ux.action.start(output);
            await this.heroku.post(`/teams/apps/${appName}/collaborators`, {
                body: { user: email, permissions: permissionsArraySorted },
            });
            core_1.ux.action.stop();
        }
        else {
            core_1.ux.action.start(output);
            await this.heroku.post(`/apps/${appName}/collaborators`, { body: { user: email } });
            core_1.ux.action.stop();
        }
    }
}
exports.default = AccessAdd;
AccessAdd.description = 'add new users to your app';
AccessAdd.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote({ char: 'r' }),
    permissions: command_1.flags.string({ char: 'p', description: 'list of permissions comma separated' }),
};
AccessAdd.examples = [
    '$ heroku access:add user@email.com --app APP # add a collaborator to your app',
    '$ heroku access:add user@email.com --app APP --permissions deploy,manage,operate # permissions must be comma separated',
];
AccessAdd.args = {
    email: core_1.Args.string({ required: true, description: 'email address of the team member' }),
};
