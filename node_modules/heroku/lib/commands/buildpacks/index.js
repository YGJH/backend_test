"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const buildpacks_1 = require("../../lib/buildpacks/buildpacks");
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const buildpacksCommand = new buildpacks_1.BuildpackCommand(this.heroku);
        const { body: app } = await this.heroku.get(`/apps/${flags.app}`, {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        const buildpacks = await buildpacksCommand.fetch(flags.app, app.generation === 'fir');
        if (buildpacks.length === 0) {
            this.log(`${color_1.default.app(flags.app)} has no Buildpacks.`);
        }
        else {
            core_1.ux.styledHeader(`${color_1.default.app(flags.app)} Buildpack${buildpacks.length > 1 ? 's' : ''}`);
            buildpacksCommand.display(buildpacks, '');
        }
    }
}
exports.default = Index;
Index.description = 'display the buildpacks for an app';
Index.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
