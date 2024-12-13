"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const open = require("open");
const disambiguate_1 = require("../../lib/pipelines/disambiguate");
class Open extends command_1.Command {
    async run() {
        const { args } = await this.parse(Open);
        const pipeline = await (0, disambiguate_1.default)(this.heroku, args.pipeline);
        await open(`https://dashboard.heroku.com/pipelines/${pipeline.id}`);
    }
}
exports.default = Open;
Open.description = 'open a pipeline in dashboard';
Open.examples = ['$ heroku pipelines:open my-pipeline'];
Open.args = {
    pipeline: core_1.Args.string({ description: 'name of pipeline', required: true }),
};
