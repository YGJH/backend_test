"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const completions_1 = require("@heroku-cli/command/lib/completions");
const tsheredoc_1 = require("tsheredoc");
class Restart extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Restart);
        const app = flags.app;
        const dyno = flags['dyno-name'] || args.dyno;
        const type = flags['process-type'];
        let msg = 'Restarting';
        let restartUrl;
        if (type) {
            msg += ` all ${color_1.default.cyan(type)} dynos`;
            restartUrl = `/apps/${app}/formations/${encodeURIComponent(type)}`;
        }
        else if (dyno) {
            if (args.dyno) {
                core_1.ux.warn(`DYNO is a deprecated argument. Use ${color_1.default.cmd('--dyno-name')} or ${color_1.default.cmd('--process-type')} instead.`);
            }
            msg += ` dyno ${color_1.default.cyan(dyno)}`;
            restartUrl = `/apps/${app}/dynos/${encodeURIComponent(dyno)}`;
        }
        else {
            msg += ' all dynos';
            restartUrl = `/apps/${app}/dynos`;
        }
        msg += ` on ${color_1.default.app(app)}`;
        core_1.ux.action.start(msg);
        await this.heroku.delete(restartUrl, {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        core_1.ux.action.stop();
    }
}
exports.default = Restart;
Restart.description = (0, tsheredoc_1.default)(`
    restart an app dyno or process type
    if neither --dyno nor --type are specified, restarts all dynos on app
  `);
Restart.topic = 'ps';
Restart.aliases = ['dyno:restart'];
Restart.hiddenAliases = ['restart'];
Restart.examples = [
    '$ heroku ps:restart --app myapp --dyno-name web.1',
    '$ heroku ps:restart --app myapp --process-type web',
    '$ heroku ps:restart --app myapp',
];
Restart.args = {
    dyno: core_1.Args.string({ description: 'name of the dyno to restart', required: false, deprecated: true }),
};
Restart.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    'dyno-name': command_1.flags.string({
        char: 'd',
        description: 'name of the dyno to restart',
    }),
    'process-type': command_1.flags.string({
        char: 'p',
        description: 'name of the process type to restart',
        completion: completions_1.ProcessTypeCompletion,
        exclusive: ['dyno-name'],
    }),
};
