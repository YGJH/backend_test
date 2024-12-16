"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Pipelines extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Pipelines);
        const { body: pipelines } = await this.heroku.get('/pipelines');
        if (flags.json) {
            core_1.ux.styledJSON(pipelines);
        }
        else {
            core_1.ux.styledHeader('My Pipelines');
            for (const pipeline of pipelines) {
                core_1.ux.log(pipeline.name);
            }
        }
    }
}
exports.default = Pipelines;
Pipelines.description = 'list pipelines you have access to';
Pipelines.examples = [
    '$ heroku pipelines',
];
Pipelines.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
