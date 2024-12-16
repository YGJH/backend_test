"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigIndex = void 0;
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const _ = require("lodash");
const quote_1 = require("../../lib/config/quote");
class ConfigIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(ConfigIndex);
        const { body: config } = await this.heroku.get(`/apps/${flags.app}/config-vars`);
        if (flags.shell) {
            Object.entries(config)
                .forEach(([k, v]) => core_1.ux.log(`${k}=${(0, quote_1.quote)(v)}`));
        }
        else if (flags.json) {
            core_1.ux.styledJSON(config);
        }
        else {
            core_1.ux.styledHeader(`${flags.app} Config Vars`);
            core_1.ux.styledObject(_.mapKeys(config, (_, k) => color_1.default.configVar(k)));
        }
    }
}
exports.ConfigIndex = ConfigIndex;
ConfigIndex.description = 'display the config vars for an app';
ConfigIndex.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    shell: command_1.flags.boolean({ char: 's', description: 'output config vars in shell format' }),
    json: command_1.flags.boolean({ char: 'j', description: 'output config vars in json format' }),
};
