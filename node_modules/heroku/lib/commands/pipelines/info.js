"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/api");
const disambiguate_1 = require("../../lib/pipelines/disambiguate");
const render_pipeline_1 = require("../../lib/pipelines/render-pipeline");
class PipelinesInfo extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(PipelinesInfo);
        const pipeline = await (0, disambiguate_1.default)(this.heroku, args.pipeline);
        const pipelineApps = await (0, api_1.listPipelineApps)(this.heroku, pipeline.id);
        if (flags.json) {
            core_1.ux.styledJSON({ pipeline, apps: pipelineApps });
        }
        else {
            await (0, render_pipeline_1.default)(this.heroku, pipeline, pipelineApps, {
                withOwners: flags['with-owners'],
                showOwnerWarning: true,
            });
        }
    }
}
exports.default = PipelinesInfo;
PipelinesInfo.description = 'show list of apps in a pipeline';
PipelinesInfo.examples = [
    '$ heroku pipelines:info my-pipeline',
];
PipelinesInfo.flags = {
    json: command_1.flags.boolean({
        description: 'output in json format',
    }),
    'with-owners': command_1.flags.boolean({
        description: 'shows owner of every app',
        hidden: true,
    }),
};
PipelinesInfo.args = {
    pipeline: core_1.Args.string({
        description: 'pipeline to show list of apps for',
        required: true,
    }),
};
