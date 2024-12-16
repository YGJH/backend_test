"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const DockerHelper = require("../../lib/container/docker_helper");
const helpers_1 = require("../../lib/container/helpers");
const debug_1 = require("../../lib/container/debug");
async function selectJobs(jobs, processTypes, recursive) {
    let filteredJobs = {};
    let selectedJobs = [];
    if (Object.keys(jobs).length === 0) {
        return selectedJobs;
    }
    if (recursive) {
        if (processTypes.length > 0) {
            filteredJobs = DockerHelper.filterByProcessType(jobs, processTypes);
        }
        else {
            filteredJobs = jobs;
        }
        selectedJobs = await DockerHelper.chooseJobs(filteredJobs);
    }
    else if (jobs.standard) {
        jobs.standard.forEach(pj => {
            pj.resource = pj.resource.replace(/standard$/, processTypes[0]);
        });
        selectedJobs = jobs.standard || [];
    }
    return selectedJobs;
}
class Push extends command_1.Command {
    async run() {
        const { argv: processTypes, flags } = await this.parse(Push);
        const { verbose, app, recursive, arg, 'context-path': contextPath } = flags;
        if (verbose) {
            debug_1.debug.enabled = true;
        }
        if (processTypes.length === 0 && !recursive) {
            core_1.ux.error('Requires either --recursive or one or more process types', { exit: 1 });
        }
        if (processTypes.length > 1 && !recursive) {
            core_1.ux.error('Requires exactly one target process type, or --recursive option', { exit: 1 });
        }
        const { body: appBody } = await this.heroku.get(`/apps/${app}`);
        (0, helpers_1.ensureContainerStack)(appBody, 'push');
        const herokuHost = process.env.HEROKU_HOST || 'heroku.com';
        const registry = `registry.${herokuHost}`;
        const dockerfiles = DockerHelper.getDockerfiles(process.cwd(), recursive);
        const possibleJobs = DockerHelper.getJobs(`${registry}/${app}`, dockerfiles);
        const jobs = await selectJobs(possibleJobs, processTypes, recursive);
        if (jobs.length === 0) {
            core_1.ux.error('No images to push', { exit: 1 });
        }
        const buildArgs = (arg === undefined) ? [] : arg.split(',');
        try {
            for (const job of jobs) {
                if (job.name === 'standard') {
                    core_1.ux.styledHeader(`Building ${processTypes} (${job.dockerfile})`);
                }
                else {
                    core_1.ux.styledHeader(`Building ${job.name} (${job.dockerfile})`);
                }
                await DockerHelper.buildImage({
                    dockerfile: job.dockerfile,
                    resource: job.resource,
                    buildArgs,
                    path: contextPath,
                    arch: this.config.arch,
                });
            }
        }
        catch (error) {
            core_1.ux.error(`docker build exited with ${error}`, { exit: 1 });
        }
        try {
            for (const job of jobs) {
                if (job.name === 'standard') {
                    core_1.ux.styledHeader(`Pushing ${processTypes} (${job.dockerfile})`);
                }
                else {
                    core_1.ux.styledHeader(`Pushing ${job.name} (${job.dockerfile})`);
                }
                await DockerHelper.pushImage(job.resource);
            }
            const plural = jobs.length !== 1;
            core_1.ux.log(`Your image${plural ? 's have' : ' has'} been successfully pushed. You can now release ${plural ? 'them' : 'it'} with the 'container:release' command.`);
        }
        catch (error) {
            core_1.ux.error(`docker push exited with ${error}`, { exit: 1 });
        }
    }
}
exports.default = Push;
Push.topic = 'container';
Push.description = 'builds, then pushes Docker images to deploy your Heroku app';
Push.strict = false;
Push.flags = {
    app: command_1.flags.app({ required: true }),
    verbose: command_1.flags.boolean({ char: 'v' }),
    recursive: command_1.flags.boolean({ char: 'R', description: 'pushes Dockerfile.<process> found in current and subdirectories' }),
    arg: command_1.flags.string({ description: 'set build-time variables' }),
    'context-path': command_1.flags.string({ description: 'path to use as build context (defaults to Dockerfile dir)' }),
    remote: command_1.flags.remote({ char: 'r' }),
};
Push.examples = [
    '$ heroku container:push web                          # Pushes Dockerfile to web process type',
    '$ heroku container:push worker                       # Pushes Dockerfile to worker process type',
    '$ heroku container:push web worker --recursive       # Pushes Dockerfile.web and Dockerfile.worker',
    '$ heroku container:push --recursive                  # Pushes Dockerfile.*',
    '$ heroku container:push web --arg ENV=live,HTTPS=on  # Build-time variables',
    '$ heroku container:push --recursive --context-path . # Pushes Dockerfile.* using current dir as build context',
];
