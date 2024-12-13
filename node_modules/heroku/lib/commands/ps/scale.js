"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const tsheredoc_1 = require("tsheredoc");
const emptyFormationErr = (app) => {
    return new Error(`No process types on ${color_1.default.magenta(app)}.\nUpload a Procfile to add process types.\nhttps://devcenter.heroku.com/articles/procfile`);
};
class Scale extends command_1.Command {
    async run() {
        const _a = await this.parse(Scale), { flags } = _a, restParse = tslib_1.__rest(_a, ["flags"]);
        const argv = restParse.argv;
        const { app } = flags;
        function parse(args) {
            return (0, lodash_1.compact)(args.map(arg => {
                const change = arg.match(/^([\w-]+)([=+-]\d+)(?::([\w-]+))?$/);
                if (!change)
                    return;
                const quantity = change[2][0] === '=' ? change[2].slice(1) : change[2];
                if (change[3])
                    change[3] = change[3].replace('Shield-', 'Private-');
                return { type: change[1], quantity, size: change[3] };
            }));
        }
        const changes = parse(argv);
        if (changes.length === 0) {
            const { body: formation } = await this.heroku.get(`/apps/${app}/formation`);
            const { body: appProps } = await this.heroku.get(`/apps/${app}`);
            const shielded = appProps.space && appProps.space.shield;
            if (shielded) {
                formation.forEach(d => {
                    if (d.size !== undefined) {
                        d.size = d.size.replace('Private-', 'Shield-');
                    }
                });
            }
            if (formation.length === 0) {
                throw emptyFormationErr(app);
            }
            core_1.ux.log(formation.map(d => `${d.type}=${d.quantity}:${d.size}`)
                .sort()
                .join(' '));
        }
        else {
            core_1.ux.action.start('Scaling dynos');
            const { body: appProps } = await this.heroku.get(`/apps/${app}`);
            const { body: formation } = await this.heroku.patch(`/apps/${app}/formation`, { body: { updates: changes } });
            const shielded = appProps.space && appProps.space.shield;
            if (shielded) {
                formation.forEach(d => {
                    if (d.size !== undefined) {
                        d.size = d.size.replace('Private-', 'Shield-');
                    }
                });
            }
            const output = formation.filter(f => changes.find(c => c.type === f.type))
                .map(d => `${color_1.default.green(d.type || '')} at ${d.quantity}:${d.size}`);
            core_1.ux.action.stop(`done, now running ${output.join(', ')}`);
        }
    }
}
exports.default = Scale;
Scale.strict = false;
Scale.description = (0, tsheredoc_1.default) `
    scale dyno quantity up or down
    Appending a size (eg. web=2:Standard-2X) allows simultaneous scaling and resizing.

    Omitting any arguments will display the app's current dyno formation, in a
    format suitable for passing back into ps:scale.
  `;
Scale.examples = [(0, tsheredoc_1.default) `
    $ heroku ps:scale web=3:Standard-2X worker+1 --app APP
    Scaling dynos... done, now running web at 3:Standard-2X, worker at 1:Standard-1X.
  `, (0, tsheredoc_1.default) `
    $ heroku ps:scale --app APP
    web=3:Standard-2X worker=1:Standard-1X
  `];
Scale.aliases = ['dyno:scale'];
Scale.hiddenAliases = ['scale'];
Scale.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
