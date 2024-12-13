"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const pipelines_1 = require("../../../lib/ci/pipelines");
const command_1 = require("@heroku-cli/command");
const api_1 = require("../../../lib/api");
const validate_1 = require("../../../lib/ci/validate");
const color_1 = require("@heroku-cli/color");
function validateInput(str) {
    if (!str.includes('=')) {
        core_1.ux.error(`${color_1.default.cyan(str)} is invalid. Must be in the format ${color_1.default.cyan('FOO=bar')}.`, { exit: 1 });
    }
    return true;
}
class CiConfigSet extends command_1.Command {
    async run() {
        const { argv, flags } = await this.parse(CiConfigSet);
        (0, validate_1.validateArgvPresent)(argv);
        const vars = {};
        for (const str of argv) {
            const iAmStr = str;
            validateInput(iAmStr);
            const [key, value] = iAmStr.split('=');
            vars[key] = value;
        }
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        core_1.ux.action.start(`Setting ${Object.keys(vars).join(', ')}`);
        await (0, api_1.setPipelineConfigVars)(this.heroku, pipeline.id, vars);
        core_1.ux.action.stop();
        core_1.ux.styledObject(Object.keys(vars).reduce((memo, key) => {
            memo[color_1.default.green(key)] = vars[key];
            return memo;
        }, {}));
    }
}
exports.default = CiConfigSet;
CiConfigSet.description = 'set CI config vars';
CiConfigSet.topic = 'ci';
CiConfigSet.examples = [
    `$ heroku ci:config:set --pipeline PIPELINE RAILS_ENV=test
    Setting test config vars... done
    RAILS_ENV: test`,
];
CiConfigSet.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    pipeline: command_1.flags.pipeline({ exactlyOne: ['pipeline', 'app'] }),
};
CiConfigSet.strict = false;
