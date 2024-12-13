"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const debug_1 = require("../../lib/container/debug");
const streamer_1 = require("../../lib/container/streamer");
const helpers_1 = require("../../lib/container/helpers");
class ContainerRelease extends command_1.Command {
    async run() {
        const { flags, argv } = await this.parse(ContainerRelease);
        const { app, verbose } = flags;
        if (argv.length === 0) {
            this.error(`Error: Requires one or more process types\n ${ContainerRelease.example}`);
        }
        if (verbose) {
            debug_1.debug.enabled = true;
        }
        const { body: appBody } = await this.heroku.get(`/apps/${app}`);
        (0, helpers_1.ensureContainerStack)(appBody, 'release');
        const herokuHost = process.env.HEROKU_HOST || 'heroku.com';
        const updateData = [];
        for (const process of argv) {
            const image = `${app}/${process}`;
            const tag = 'latest';
            const { body: imageResp } = await this.heroku.get(`/v2/${image}/manifests/${tag}`, {
                hostname: `registry.${herokuHost}`,
                headers: {
                    Accept: 'application/vnd.docker.distribution.manifest.v2+json',
                    Authorization: `Basic ${Buffer.from(`:${this.heroku.auth}`).toString('base64')}`,
                }
            });
            let imageID;
            let v1Comp;
            switch (imageResp.schemaVersion) {
                case 1:
                    v1Comp = JSON.parse(imageResp.history[0].v1Compatibility);
                    imageID = v1Comp.id;
                    break;
                case 2:
                    imageID = imageResp.config.digest;
                    break;
            }
            updateData.push({
                type: process, docker_image: imageID,
            });
        }
        const { body: oldReleases } = await this.heroku.get(`/apps/${app}/releases`, {
            partial: true, headers: { Range: 'version ..; max=1, order=desc' },
        });
        const oldRelease = oldReleases[0];
        core_1.ux.action.start(`Releasing images ${argv.join(',')} to ${app}`);
        await this.heroku.patch(`/apps/${app}/formation`, {
            body: { updates: updateData }, headers: {
                Accept: 'application/vnd.heroku+json; version=3.docker-releases',
            },
        });
        core_1.ux.action.stop();
        const { body: updatedReleases } = await this.heroku.get(`/apps/${app}/releases`, {
            partial: true, headers: { Range: 'version ..; max=1, order=desc' },
        });
        const release = updatedReleases[0];
        if ((!oldRelease && !release) || (oldRelease && (oldRelease.id === release.id))) {
            return;
        }
        if (release.status === 'failed') {
            core_1.ux.error('Error: release command failed', { exit: 1 });
        }
        else if ((release.status === 'pending') && release.output_stream_url) {
            core_1.ux.log('Running release command...');
            await (0, streamer_1.streamer)(release.output_stream_url, process.stdout);
            const { body: finishedRelease } = await this.heroku.request(`/apps/${app}/releases/${release.id}`);
            if (finishedRelease.status === 'failed') {
                core_1.ux.error('Error: release command failed', { exit: 1 });
            }
        }
    }
}
exports.default = ContainerRelease;
ContainerRelease.topic = 'container';
ContainerRelease.description = 'Releases previously pushed Docker images to your Heroku app';
ContainerRelease.usage = 'container:release';
ContainerRelease.example = `
  ${color_1.default.cmd('heroku container:release web')}        # Releases the previously pushed web process type
  ${color_1.default.cmd('heroku container:release web worker')} # Releases the previously pushed web and worker process types`;
ContainerRelease.strict = false;
ContainerRelease.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    verbose: command_1.flags.boolean({ char: 'v' }),
};
