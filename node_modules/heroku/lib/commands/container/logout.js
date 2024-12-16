"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const DockerHelper = require("../../lib/container/docker_helper");
const debug_1 = require("../../lib/container/debug");
function dockerLogout(registry) {
    const args = [
        'logout',
        registry,
    ];
    return DockerHelper.cmd('docker', args);
}
class Logout extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Logout);
        const { verbose } = flags;
        const herokuHost = process.env.HEROKU_HOST || 'heroku.com';
        const registry = `registry.${herokuHost}`;
        if (verbose) {
            debug_1.debug.enabled = true;
        }
        try {
            await dockerLogout(registry);
        }
        catch (error) {
            const { message } = error;
            core_1.ux.error(`Error: docker logout exited${message ? ` with: ${message}` : ''}.`);
        }
    }
}
exports.default = Logout;
Logout.topic = 'container';
Logout.description = 'log out from Heroku Container Registry';
Logout.flags = {
    verbose: command_1.flags.boolean({ char: 'v' }),
};
