"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const shellescape = require("shell-escape");
const pipelines_1 = require("../../../lib/ci/pipelines");
const api_1 = require("../../../lib/api");
class CiConfig extends command_1.Command {
    async run() {
        const { flags } = await this.parse(CiConfig);
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        const { body: config } = await (0, api_1.getPipelineConfigVars)(this.heroku, pipeline.id);
        if (flags.shell) {
            Object.keys(config).forEach(key => {
                core_1.ux.log(`${key}=${shellescape([config[key]])}`);
            });
        }
        else if (flags.json) {
            core_1.ux.styledJSON(config);
        }
        else {
            core_1.ux.styledHeader(`${pipeline.name} test config vars`);
            const formattedConfig = {};
            Object.keys(config).forEach(key => {
                formattedConfig[color_1.default.green(key)] = config[key];
            });
            core_1.ux.styledObject(formattedConfig);
        }
    }
}
exports.default = CiConfig;
CiConfig.description = 'display CI config vars';
CiConfig.examples = [
    `$ heroku ci:config --app murmuring-headland-14719 --json
`,
];
CiConfig.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    shell: command_1.flags.boolean({ char: 's', description: 'output config vars in shell format' }),
    json: command_1.flags.boolean({ description: 'output config vars in json format' }),
    pipeline: command_1.flags.pipeline({ exactlyOne: ['pipeline', 'app'] }),
};
