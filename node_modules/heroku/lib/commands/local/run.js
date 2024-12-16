"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const completions_1 = require("@heroku-cli/command/lib/completions");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const fork_foreman_1 = require("../../lib/local/fork-foreman");
const helpers_1 = require("../../lib/run/helpers");
const fs = require("fs");
class Run extends core_1.Command {
    async run() {
        const execArgv = ['run'];
        const { argv, flags } = await this.parse(Run);
        const commandArgs = (0, helpers_1.revertSortedArgs)(process.argv, argv);
        if (commandArgs.length === 0) {
            const errorMessage = 'Usage: heroku local:run [COMMAND]\nMust specify command to run';
            this.error(errorMessage, { exit: -1 });
        }
        let envFile = flags.env || '.env';
        if (fs.existsSync(envFile) && !fs.statSync(envFile).isFile()) {
            this.warn(`The specified location for the env file, ${color_1.default.bold(envFile)}, is not a file, ignoring.`);
            envFile = '';
        }
        execArgv.push('--env', envFile);
        if (flags.port)
            execArgv.push('--port', flags.port);
        execArgv.push('--'); // disable node-foreman flag parsing
        execArgv.push(...commandArgs); // eslint-disable-line unicorn/no-array-push-push
        await (0, fork_foreman_1.fork)(execArgv);
    }
}
exports.default = Run;
Run.description = 'run a one-off command';
Run.examples = [
    '$ heroku local:run bin/migrate',
];
Run.strict = false;
Run.flags = {
    env: core_1.Flags.string({
        char: 'e',
        completion: completions_1.FileCompletion,
    }),
    port: core_1.Flags.string({
        char: 'p',
    }),
};
