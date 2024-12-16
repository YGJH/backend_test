"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const DockerHelper = require("../../lib/container/docker_helper");
const debug_1 = require("../../lib/container/debug");
async function dockerLogin(registry, password) {
    const [major, minor] = await DockerHelper.version();
    if (major > 17 || (major === 17 && minor >= 7)) {
        return dockerLoginStdin(registry, password);
    }
    return dockerLoginArgv(registry, password);
}
function dockerLoginStdin(registry, password) {
    const args = [
        'login',
        '--username=_',
        '--password-stdin',
        registry,
    ];
    return DockerHelper.cmd('docker', args, { input: password });
}
function dockerLoginArgv(registry, password) {
    const args = [
        'login',
        '--username=_',
        `--password=${password}`,
        registry,
    ];
    return DockerHelper.cmd('docker', args);
}
class Login extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Login);
        const { verbose } = flags;
        const herokuHost = process.env.HEROKU_HOST || 'heroku.com';
        const registry = `registry.${herokuHost}`;
        const password = this.heroku.auth;
        if (verbose) {
            debug_1.debug.enabled = true;
        }
        if (!password)
            throw new Error('not logged in');
        try {
            await dockerLogin(registry, password);
        }
        catch (error) {
            core_1.ux.error(`Login failed${error.message ? ` with: ${error.message}` : ''}.`, { exit: 1 });
        }
    }
}
exports.default = Login;
Login.topic = 'container';
Login.description = 'log in to Heroku Container Registry';
Login.flags = {
    verbose: command_1.flags.boolean({ char: 'v' }),
};
