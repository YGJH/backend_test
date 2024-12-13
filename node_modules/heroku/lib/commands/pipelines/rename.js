"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/api");
const disambiguate_1 = require("../../lib/pipelines/disambiguate");
class PipelinesRename extends command_1.Command {
    async run() {
        const { args } = await this.parse(PipelinesRename);
        const pipeline = await (0, disambiguate_1.default)(this.heroku, args.pipeline);
        core_1.ux.action.start(`Renaming ${color_1.default.pipeline(pipeline.name)} pipeline to ${color_1.default.pipeline(args.name)}`);
        await (0, api_1.updatePipeline)(this.heroku, pipeline.id, {
            name: args.name,
        });
        core_1.ux.action.stop();
    }
}
exports.default = PipelinesRename;
PipelinesRename.description = 'rename a pipeline';
PipelinesRename.examples = [
    '$ heroku pipelines:rename my-pipeline new-pipeline-name',
];
PipelinesRename.args = {
    pipeline: core_1.Args.string({
        description: 'current name of pipeline',
        required: true,
    }),
    name: core_1.Args.string({
        description: 'new name of pipeline',
        required: true,
    }),
};
