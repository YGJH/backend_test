"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
const _ = require("lodash");
const color_1 = require("@heroku-cli/color");
function updateCedarName(stack) {
    if (stack === 'cedar') {
        return 'cedar-10';
    }
    return stack;
}
class StacksIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(StacksIndex);
        const [appResponse, stackResponse] = await Promise.all([
            this.heroku.get(`/apps/${flags.app}`),
            this.heroku.get('/stacks'),
        ]);
        const app = appResponse.body;
        const stacks = stackResponse.body;
        const sortedStacks = _.sortBy(stacks, 'name');
        core_1.ux.styledHeader(`${color_1.default.app(app.name)} Available Stacks`);
        for (const stack of sortedStacks) {
            if (stack.name === app.stack.name) {
                core_1.ux.log(color_1.default.green('* ' + updateCedarName(stack.name)));
            }
            else if (stack.name === app.build_stack.name) {
                core_1.ux.log(`  ${updateCedarName(stack.name)} (active on next deploy)`);
            }
            else {
                core_1.ux.log(`  ${updateCedarName(stack.name)}`);
            }
        }
    }
}
exports.default = StacksIndex;
StacksIndex.description = 'show the list of available stacks';
StacksIndex.topic = 'apps';
StacksIndex.hiddenAliases = ['stack'];
StacksIndex.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
