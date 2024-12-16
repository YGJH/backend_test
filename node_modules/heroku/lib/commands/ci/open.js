"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const open = require("open");
const pipelines_1 = require("../../lib/ci/pipelines");
class CiOpen extends command_1.Command {
    async run() {
        const { flags } = await this.parse(CiOpen);
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        await open(`https://dashboard.heroku.com/pipelines/${pipeline.id}/tests`);
    }
}
exports.default = CiOpen;
CiOpen.description = 'open the Dashboard version of Heroku CI';
CiOpen.topic = 'ci';
CiOpen.examples = [
    '$ heroku ci:open --app murmuring-headland-14719',
];
CiOpen.flags = {
    help: command_1.flags.help({ char: 'h' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    pipeline: command_1.flags.pipeline({ required: false }),
};
