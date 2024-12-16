"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class SessionsDestroy extends command_1.Command {
    async run() {
        const { args: { id } } = await this.parse(SessionsDestroy);
        core_1.ux.action.start(`Destroying ${color_1.default.cyan(id)}`);
        await this.heroku.delete(`/oauth/sessions/${encodeURIComponent(id)}`);
        core_1.ux.action.stop();
    }
}
exports.default = SessionsDestroy;
SessionsDestroy.description = 'delete (logout) OAuth session by ID';
SessionsDestroy.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the OAuth session' }),
};
