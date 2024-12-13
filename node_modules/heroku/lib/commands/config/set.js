"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const lodash_1 = require("lodash");
const core_1 = require("@oclif/core");
const lastRelease = async (client, app) => {
    const { body: releases } = await client.get(`/apps/${app}/releases`, {
        method: 'GET',
        partial: true,
        headers: { Range: 'version ..; order=desc,max=1' },
    });
    return releases[0];
};
class Set extends command_1.Command {
    async run() {
        const { flags, argv: _argv } = await this.parse(Set);
        const argv = _argv;
        if (argv.length === 0) {
            core_1.ux.error('Usage: heroku config:set KEY1=VALUE1 [KEY2=VALUE2 ...]\nMust specify KEY and VALUE to set.', { exit: 1 });
        }
        const vars = {};
        argv.forEach((v) => {
            const idx = v.indexOf('=');
            if (idx === -1) {
                core_1.ux.error(`${color_1.default.cyan(v)} is invalid. Must be in the format ${color_1.default.cyan('FOO=bar')}.`, { exit: 1 });
            }
            vars[v.slice(0, idx)] = v.slice(idx + 1);
        });
        const varsCopy = argv.map((v) => color_1.default.green(v.split('=')[0])).join(', ');
        core_1.ux.action.start(`Setting ${varsCopy} and restarting ${color_1.default.app(flags.app)}`);
        let { body: config } = await this.heroku.patch(`/apps/${flags.app}/config-vars`, {
            body: vars,
        });
        const release = await lastRelease(this.heroku, flags.app);
        core_1.ux.action.stop(`done, ${color_1.default.release('v' + release.version)}`);
        config = (0, lodash_1.pickBy)(config, (_, k) => vars[k]);
        config = (0, lodash_1.mapKeys)(config, (_, k) => color_1.default.green(k));
        core_1.ux.styledObject(config);
        await this.config.runHook('recache', { type: 'config', app: flags.app });
    }
}
exports.default = Set;
Set.description = 'set one or more config vars';
Set.strict = false;
Set.hiddenAliases = ['config:add'];
Set.examples = [
    `$ heroku config:set RAILS_ENV=staging
Setting config vars and restarting example... done, v10
RAILS_ENV: staging

$ heroku config:set RAILS_ENV=staging RACK_ENV=staging
Setting config vars and restarting example... done, v11
RAILS_ENV: staging
RACK_ENV:  staging`,
];
Set.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
