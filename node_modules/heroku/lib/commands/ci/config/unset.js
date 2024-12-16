"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const pipelines_1 = require("../../../lib/ci/pipelines");
const api_1 = require("../../../lib/api");
const validate_1 = require("../../../lib/ci/validate");
class CiConfigUnset extends command_1.Command {
    async run() {
        const { argv, flags } = await this.parse(CiConfigUnset);
        const isUnset = true;
        (0, validate_1.validateArgvPresent)(argv, isUnset);
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        const vars = {};
        for (const str of argv) {
            const iAmStr = str;
            vars[iAmStr] = null;
        }
        await core_1.ux.action.start(`Unsetting ${Object.keys(vars).join(', ')}`);
        (0, api_1.setPipelineConfigVars)(this.heroku, pipeline.id, vars);
        core_1.ux.action.stop();
    }
}
exports.default = CiConfigUnset;
CiConfigUnset.description = 'unset CI config vars';
CiConfigUnset.topic = 'ci';
CiConfigUnset.examples = [
    '$ heroku ci:config:unset RAILS_ENV',
];
CiConfigUnset.strict = false;
CiConfigUnset.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    pipeline: command_1.flags.pipeline({ exactlyOne: ['pipeline', 'app'] }),
};
