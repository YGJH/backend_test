"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const shellescape = require("shell-escape");
const api_1 = require("../../../lib/api");
const pipelines_1 = require("../../../lib/ci/pipelines");
class CiConfigGet extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(CiConfigGet);
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        const { body: config } = await (0, api_1.getPipelineConfigVars)(this.heroku, pipeline.id);
        const value = config[args.key];
        if (flags.shell) {
            core_1.ux.log(`${args.key}=${shellescape([value])}`);
        }
        else {
            core_1.ux.log((value !== null && value !== undefined) ? value : 'undefined');
        }
    }
}
exports.default = CiConfigGet;
CiConfigGet.description = 'get a CI config var';
CiConfigGet.topic = 'ci';
CiConfigGet.examples = [
    `$ heroku ci:config:get --pipeline=PIPELINE RAILS_ENV
    test`,
];
CiConfigGet.flags = {
    help: command_1.flags.help({ char: 'h' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    pipeline: command_1.flags.pipeline({ exactlyOne: ['pipeline', 'app'] }),
    shell: command_1.flags.boolean({ char: 's', description: 'output config var in shell format' }),
};
CiConfigGet.args = {
    key: core_1.Args.string({ required: true, description: 'name of the config var key' }),
};
