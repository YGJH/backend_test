"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const push_1 = require("../../../lib/git/push");
function map(stack) {
    return stack === 'cedar-10' ? 'cedar' : stack;
}
class Set extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags, args } = await this.parse(Set);
        const stack = map(args.stack);
        core_1.ux.action.start(`Setting stack to ${color_1.default.green(stack)}`);
        const { body: app } = await this.heroku.patch(`/apps/${flags.app}`, {
            body: { build_stack: stack },
        });
        // A redeployment is not required for apps that have never been deployed, since
        // API updates the app's `stack` to match `build_stack` immediately.
        if (((_a = app.stack) === null || _a === void 0 ? void 0 : _a.name) !== ((_b = app.build_stack) === null || _b === void 0 ? void 0 : _b.name)) {
            core_1.ux.log(`You will need to redeploy ${color_1.default.app(flags.app)} for the change to take effect.`);
            core_1.ux.log(`Run ${color_1.default.cmd((0, push_1.default)(flags.remote))} to trigger a new build on ${color_1.default.app(flags.app)}.`);
        }
        core_1.ux.action.stop();
    }
}
exports.default = Set;
Set.description = 'set the stack of an app';
Set.example = `$ heroku stack:set heroku-24 -a myapp
Setting stack to heroku-24... done
You will need to redeploy myapp for the change to take effect.
Run git push heroku main to trigger a new build on myapp.`;
Set.hiddenAliases = ['stack:set'];
Set.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Set.args = {
    stack: core_1.Args.string({ required: true, description: 'unique name or identifier of the stack' }),
};
