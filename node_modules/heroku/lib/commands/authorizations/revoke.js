"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class AuthorizationsRevoke extends command_1.Command {
    async run() {
        const { args } = await this.parse(AuthorizationsRevoke);
        core_1.ux.action.start('Revoking OAuth Authorization');
        const { body: auth } = await this.heroku.delete(`/oauth/authorizations/${encodeURIComponent(args.id)}`);
        core_1.ux.action.stop(`done, revoked authorization from ${color_1.default.cyan(auth.description)}`);
    }
}
exports.default = AuthorizationsRevoke;
AuthorizationsRevoke.description = 'revoke OAuth authorization';
AuthorizationsRevoke.aliases = ['authorizations:revoke', 'authorizations:destroy'];
AuthorizationsRevoke.examples = [
    '$ heroku authorizations:revoke 105a7bfa-34c3-476e-873a-b1ac3fdc12fb',
];
AuthorizationsRevoke.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the authorization' }),
};
