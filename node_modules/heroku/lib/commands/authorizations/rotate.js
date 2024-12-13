"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const authorizations_1 = require("../../lib/authorizations/authorizations");
class AuthorizationsRotate extends command_1.Command {
    async run() {
        const { args } = await this.parse(AuthorizationsRotate);
        core_1.ux.action.start('Rotating OAuth Authorization');
        const { body: authorization } = await this.heroku.post(`/oauth/authorizations/${encodeURIComponent(args.id)}/actions/regenerate-tokens`);
        core_1.ux.action.stop();
        (0, authorizations_1.display)(authorization);
    }
}
exports.default = AuthorizationsRotate;
AuthorizationsRotate.description = 'updates an OAuth authorization token';
AuthorizationsRotate.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the authorization' }),
};
