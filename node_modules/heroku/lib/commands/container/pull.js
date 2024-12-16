"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const DockerHelper = require("../../lib/container/docker_helper");
const helpers_1 = require("../../lib/container/helpers");
const debug_1 = require("../../lib/container/debug");
const color_1 = require("@heroku-cli/color");
class Pull extends command_1.Command {
    async run() {
        const { argv, flags } = await this.parse(Pull);
        const { verbose, app } = flags;
        if (argv.length === 0) {
            this.error(`Error: Requires one or more process types\n${Pull.example}`);
        }
        const { body: appBody } = await this.heroku.get(`/apps/${app}`);
        (0, helpers_1.ensureContainerStack)(appBody, 'pull');
        const herokuHost = process.env.HEROKU_HOST || 'heroku.com';
        const registry = `registry.${herokuHost}`;
        if (verbose) {
            debug_1.debug.enabled = true;
        }
        for (const process of argv) {
            const tag = `${registry}/${app}/${process}`;
            core_1.ux.styledHeader(`Pulling ${process} as ${tag}`);
            await DockerHelper.pullImage(tag);
        }
    }
}
exports.default = Pull;
Pull.topic = 'container';
Pull.description = 'pulls an image from an app\'s process type';
Pull.usage = 'container:pull -a APP [-v] PROCESS_TYPE...';
Pull.example = `
  ${color_1.default.cmd('$ heroku container:pull web')}        # Pulls the web image from the app
  ${color_1.default.cmd('$ heroku container:pull web worker')} # Pulls both the web and worker images from the app
  ${color_1.default.cmd('$ heroku container:pull web:latest')} # Pulls the latest tag from the web image`;
Pull.strict = false;
Pull.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    verbose: command_1.flags.boolean({ char: 'v' }),
};
