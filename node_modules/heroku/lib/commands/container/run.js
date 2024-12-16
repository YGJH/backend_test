"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const DockerHelper = require("../../lib/container/docker_helper");
const helpers_1 = require("../../lib/container/helpers");
const debug_1 = require("../../lib/container/debug");
const color_1 = require("@heroku-cli/color");
class Run extends command_1.Command {
    async run() {
        const { argv, flags } = await this.parse(Run);
        const { verbose, app, port } = flags;
        if (argv.length === 0) {
            this.error(`Error: Requires one process type\n${Run.example}`);
        }
        if (verbose) {
            debug_1.debug.enabled = true;
        }
        const { body: appBody } = await this.heroku.get(`/apps/${app}`);
        (0, helpers_1.ensureContainerStack)(appBody, 'run');
        const processType = argv.shift();
        const command = argv.join(' ');
        const herokuHost = process.env.HEROKU_HOST || 'heroku.com';
        const registry = `registry.${herokuHost}`;
        const dockerfiles = DockerHelper.getDockerfiles(process.cwd(), false);
        const possibleJobs = DockerHelper.getJobs(`${registry}/${app}`, dockerfiles);
        let jobs = [];
        if (possibleJobs.standard) {
            possibleJobs.standard.forEach((pj) => {
                pj.resource = pj.resource.replace(/standard$/, processType);
            });
            jobs = possibleJobs.standard || [];
        }
        if (jobs.length === 0) {
            core_1.ux.error('No images to run');
        }
        const job = jobs[0];
        if (command.length === 0) {
            core_1.ux.styledHeader(`Running ${job.resource}`);
        }
        else {
            core_1.ux.styledHeader(`Running '${command}' on ${job.resource}`);
        }
        try {
            await DockerHelper.runImage(job.resource, command, port);
        }
        catch (error) {
            core_1.ux.error(`docker run exited with ${error}`);
        }
    }
}
exports.default = Run;
Run.topic = 'container';
Run.description = 'builds, then runs the docker image locally';
Run.usage = 'container:run -a APP [-v] PROCESS_TYPE...';
Run.example = `
  ${color_1.default.cmd('$ heroku container:pull web')}        # Pulls the web image from the app
  ${color_1.default.cmd('$ heroku container:pull web worker')} # Pulls both the web and worker images from the app
  ${color_1.default.cmd('$ heroku container:pull web:latest')} # Pulls the latest tag from the web image`;
Run.strict = false;
Run.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    port: command_1.flags.integer({ char: 'p', description: 'port the app will run on', default: 5000 }),
    verbose: command_1.flags.boolean({ char: 'v' }),
};
