"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const completions_1 = require("@heroku-cli/command/lib/completions");
const tsheredoc_1 = require("tsheredoc");
class Stop extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Stop);
        const app = flags.app;
        const dyno = flags['dyno-name'] || args.dyno;
        const type = flags['process-type'];
        let msg = 'Stopping';
        let stopUrl = '';
        if (type) {
            msg += ` all ${color_1.default.cyan(type)} dynos`;
            stopUrl = `/apps/${app}/formations/${encodeURIComponent(type)}/actions/stop`;
        }
        else if (dyno) {
            if (args.dyno) {
                core_1.ux.warn(`DYNO is a deprecated argument. Use ${color_1.default.cmd('--dyno-name')} or ${color_1.default.cmd('--process-type')} instead.`);
            }
            msg += ` dyno ${color_1.default.cyan(dyno)}`;
            stopUrl = `/apps/${app}/dynos/${encodeURIComponent(dyno)}/actions/stop`;
        }
        else {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Please specify a process type or dyno name to stop.
        See more help with --help
      `));
        }
        msg += ` on ${color_1.default.app(app)}`;
        core_1.ux.action.start(msg);
        await this.heroku.post(stopUrl, { headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' } });
        core_1.ux.action.stop();
    }
}
exports.default = Stop;
Stop.description = 'stop an app dyno or process type';
Stop.topic = 'ps';
Stop.aliases = ['dyno:stop', 'ps:kill', 'dyno:kill'];
Stop.hiddenAliases = ['stop', 'kill'];
Stop.examples = [
    '$ heroku ps:stop --app myapp --dyno-name run.1828',
    '$ heroku ps:stop --app myapp --process-type run',
];
Stop.args = {
    dyno: core_1.Args.string({ description: 'name of the dyno to stop', required: false, deprecated: true }),
};
Stop.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    'dyno-name': command_1.flags.string({
        char: 'd',
        description: 'name of the dyno to stop',
    }),
    'process-type': command_1.flags.string({
        char: 'p',
        description: 'name of the process type to stop',
        completion: completions_1.ProcessTypeCompletion,
        exclusive: ['dyno-name'],
    }),
};
