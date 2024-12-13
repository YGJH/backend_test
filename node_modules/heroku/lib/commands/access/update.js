"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const teamUtils_1 = require("../../lib/teamUtils");
class Update extends command_1.Command {
    async run() {
        var _a;
        const { flags, args } = await this.parse(Update);
        const appName = flags.app;
        let permissions = flags.permissions.split(',');
        const { body: appInfo } = await this.heroku.get(`/apps/${appName}`);
        if (!(0, teamUtils_1.isTeamApp)((_a = appInfo === null || appInfo === void 0 ? void 0 : appInfo.owner) === null || _a === void 0 ? void 0 : _a.email))
            this.error(`Error: cannot update permissions. The app ${color_1.default.cyan(appName)} is not owned by a team`);
        permissions.push('view');
        permissions = Array.from(new Set(permissions.sort()));
        core_1.ux.action.start(`Updating ${args.email} in application ${color_1.default.cyan(appName)} with ${permissions} permissions`);
        await this.heroku.patch(`/teams/apps/${appName}/collaborators/${args.email}`, {
            body: { permissions: permissions },
        });
        core_1.ux.action.stop();
    }
}
exports.default = Update;
Update.topic = 'access';
Update.description = 'update existing collaborators on an team app';
Update.flags = {
    permissions: command_1.flags.string({
        char: 'p',
        description: 'comma-delimited list of permissions to update (deploy,manage,operate)',
        required: true,
    }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Update.args = {
    email: core_1.Args.string({ required: true, description: 'email address of the team member' }),
};
