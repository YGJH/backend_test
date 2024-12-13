"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureContainerStack = void 0;
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const stackLabelMap = {
    cnb: 'Cloud Native Buildpack',
};
/**
 * Ensure that the given app is a container app.
 * @param app {Heroku.App} heroku app
 * @param cmd {String} command name
 * @returns {null} null
 */
function ensureContainerStack(app, cmd) {
    var _a, _b;
    const buildStack = (_a = app.build_stack) === null || _a === void 0 ? void 0 : _a.name;
    const appStack = (_b = app.stack) === null || _b === void 0 ? void 0 : _b.name;
    const allowedStack = 'container';
    // either can be container stack and are allowed
    if (buildStack !== allowedStack && appStack !== allowedStack) {
        let message = 'This command is for Docker apps only.';
        if (['push', 'release'].includes(cmd)) {
            message += ` Switch stacks by running ${color_1.default.cmd('heroku stack:set container')}. Or, to deploy ${color_1.default.app(app.name)} with ${color_1.default.yellow(appStack)}, run ${color_1.default.cmd('git push heroku main')} instead.`;
        }
        core_1.ux.error(message, { exit: 1 });
    }
}
exports.ensureContainerStack = ensureContainerStack;
