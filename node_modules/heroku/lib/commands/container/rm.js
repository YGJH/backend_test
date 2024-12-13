"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const helpers_1 = require("../../lib/container/helpers");
class Rm extends command_1.Command {
    async run() {
        const { argv, flags } = await this.parse(Rm);
        const { app } = flags;
        if (argv.length === 0) {
            this.error(`Error: Requires one or more process types\n${Rm.example}`);
        }
        const { body: appBody } = await this.heroku.get(`/apps/${app}`);
        (0, helpers_1.ensureContainerStack)(appBody, 'rm');
        for (const process of argv) {
            core_1.ux.action.start(`Removing container ${process} for ${color_1.default.app(app)}`);
            await this.heroku.patch(`/apps/${app}/formation/${process}`, {
                headers: {
                    Accept: 'application/vnd.heroku+json; version=3.docker-releases',
                },
                body: { docker_image: null },
            });
            core_1.ux.action.stop();
        }
    }
}
exports.default = Rm;
Rm.topic = 'container';
Rm.description = 'remove the process type from your app';
Rm.usage = 'container:rm -a APP [-v] PROCESS_TYPE...';
Rm.example = `
  ${color_1.default.cmd('heroku container:rm web')}        # Destroys the web container
  ${color_1.default.cmd('heroku container:rm web worker')} # Destroys the web and worker containers`;
Rm.strict = false;
Rm.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
