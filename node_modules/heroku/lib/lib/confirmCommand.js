"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
async function confirmCommand(app, confirm, message) {
    if (confirm) {
        if (confirm === app)
            return;
        throw new Error(`Confirmation ${color_1.default.bold.red(confirm)} did not match ${color_1.default.bold.red(app)}. Aborted.`);
    }
    if (!message) {
        message = `WARNING: Destructive Action
This command will affect the app ${color_1.default.bold.red(app)}`;
    }
    core_1.ux.warn(message);
    console.error();
    const entered = await core_1.ux.prompt(`To proceed, type ${color_1.default.bold.red(app)} or re-run this command with ${color_1.default.bold.red('--confirm', app)}`, { required: true });
    if (entered === app) {
        return;
    }
    throw new Error(`Confirmation did not match ${color_1.default.bold.red(app)}. Aborted.`);
}
exports.default = confirmCommand;
