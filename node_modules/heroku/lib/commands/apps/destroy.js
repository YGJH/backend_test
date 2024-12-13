"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const confirmCommand_1 = require("../../lib/confirmCommand");
const git = require("../../lib/ci/git");
class Destroy extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Destroy);
        const app = args.app || flags.app;
        if (!app)
            throw new Error('No app specified.\nUSAGE: heroku apps:destroy APPNAME');
        // this appears to report errors if app not found
        await this.heroku.get(`/apps/${app}`);
        await (0, confirmCommand_1.default)(app, flags.confirm, `WARNING: This will delete ${color_1.default.app(app)} including all add-ons.`);
        core_1.ux.action.start(`Destroying ${color_1.default.app(app)} (including all add-ons)`);
        await this.heroku.delete(`/apps/${app}`);
        if (git.inGitRepo()) {
            // delete git remotes pointing to this app
            await git.listRemotes()
                .then(remotes => {
                const transformed = remotes
                    .filter(r => git.gitUrl(app) === r[1] || git.sshGitUrl(app) === r[1])
                    .map(r => r[0]);
                const uniqueRemotes = (0, lodash_1.uniq)(transformed);
                uniqueRemotes.forEach(element => {
                    git.rmRemote(element);
                });
            });
        }
        core_1.ux.action.stop();
    }
}
exports.default = Destroy;
Destroy.description = 'permanently destroy an app';
Destroy.help = 'This will also destroy all add-ons on the app.';
Destroy.hiddenAliases = ['destroy', 'apps:delete'];
Destroy.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    confirm: command_1.flags.string({ char: 'c' }),
};
Destroy.args = {
    app: core_1.Args.string({ hidden: true }),
};
