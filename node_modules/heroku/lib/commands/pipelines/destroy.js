"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/api");
const disambiguate_1 = require("../../lib/pipelines/disambiguate");
class PipelinesDestroy extends command_1.Command {
    async run() {
        const { args } = await this.parse(PipelinesDestroy);
        const pipeline = await (0, disambiguate_1.default)(this.heroku, args.pipeline);
        core_1.ux.action.start(`Destroying ${color_1.default.pipeline(pipeline.name)} pipeline`);
        await (0, api_1.destroyPipeline)(this.heroku, pipeline.name, pipeline.id);
        core_1.ux.action.stop();
    }
}
exports.default = PipelinesDestroy;
PipelinesDestroy.description = 'destroy a pipeline';
PipelinesDestroy.examples = [
    '$ heroku pipelines:destroy my-pipeline',
];
PipelinesDestroy.args = {
    pipeline: core_1.Args.string({
        description: 'name of pipeline',
        required: true,
    }),
};
