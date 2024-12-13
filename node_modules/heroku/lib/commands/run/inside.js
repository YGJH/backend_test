"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const debug_1 = require("debug");
const tsheredoc_1 = require("tsheredoc");
const dyno_1 = require("../../lib/run/dyno");
const helpers_1 = require("../../lib/run/helpers");
const debug = (0, debug_1.default)('heroku:run:inside');
class RunInside extends command_1.Command {
    async run() {
        const { args, argv, flags } = await this.parse(RunInside);
        const { dyno_name: dynoName } = args;
        const { app: appName, 'exit-code': exitCode, listen, 'no-launcher': noLauncher } = flags;
        const prependLauncher = !noLauncher;
        const { body: app } = await this.heroku.get(`/apps/${appName}`, {
            headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
        });
        const appStackIsCnb = app.stack.name === 'cnb';
        const opts = {
            app: appName,
            command: (0, helpers_1.buildCommand)(argv.slice(1), appStackIsCnb && prependLauncher),
            dyno: dynoName,
            'exit-code': exitCode,
            heroku: this.heroku,
            listen,
        };
        const dyno = new dyno_1.default(opts);
        try {
            await dyno.start();
        }
        catch (error) {
            debug(error);
            if (error.exitCode) {
                core_1.ux.exit(error.exitCode);
            }
            else {
                throw error;
            }
        }
    }
}
exports.default = RunInside;
RunInside.description = 'run a command inside an existing dyno (for Fir-generation apps only)';
RunInside.strict = false;
RunInside.args = {
    dyno_name: core_1.Args.string({
        description: 'name of the dyno to run command inside',
        required: true,
    }),
    command: core_1.Args.string({
        description: 'command to run (Heroku automatically prepends ‘launcher’ to the command)',
        required: true,
    }),
};
RunInside.flags = {
    app: command_1.flags.app({ required: true }),
    'exit-code': command_1.flags.boolean({
        char: 'x',
        description: 'passthrough the exit code of the remote command',
    }),
    listen: command_1.flags.boolean({ description: 'listen on a local port', hidden: true }),
    'no-launcher': command_1.flags.boolean({
        description: 'don’t prepend ‘launcher’ before a command',
        default: false,
    }),
    remote: command_1.flags.remote(),
};
RunInside.examples = [
    (0, tsheredoc_1.default) `
      Run bash
      heroku run:inside web-848cd4f64d-pvpr2 bash -a my-app
    `,
    (0, tsheredoc_1.default) `
      Run a command supplied by a script taking option flags
      heroku run:inside web-848cd4f64d-pvpr2 -a my-app -- myscript.sh -x --log-level=warn
    `,
    (0, tsheredoc_1.default) `
      Run a command declared for the worker process type in a Procfile
      heroku run:inside web-848cd4f64d-pvpr2 worker -a my-app
    `,
];
