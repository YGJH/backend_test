"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const completions_1 = require("@heroku-cli/command/lib/completions");
const core_1 = require("@oclif/core");
const authorizations_1 = require("../../lib/authorizations/authorizations");
class AuthorizationsCreate extends command_1.Command {
    async run() {
        const { flags } = await this.parse(AuthorizationsCreate);
        core_1.ux.action.start('Creating OAuth Authorization');
        const { body: auth } = await this.heroku.post('/oauth/authorizations', {
            body: {
                description: flags.description,
                scope: flags.scope ? flags.scope.split(',') : undefined,
                expires_in: flags['expires-in'],
            },
        });
        core_1.ux.action.stop();
        if (flags.short) {
            core_1.ux.log(auth.access_token && auth.access_token.token);
        }
        else if (flags.json) {
            core_1.ux.styledJSON(auth);
        }
        else {
            (0, authorizations_1.display)(auth);
        }
    }
}
exports.default = AuthorizationsCreate;
AuthorizationsCreate.description = 'create a new OAuth authorization';
AuthorizationsCreate.examples = [
    '$ heroku authorizations:create --description "For use with Anvil"',
];
AuthorizationsCreate.flags = {
    description: command_1.flags.string({ char: 'd', description: 'set a custom authorization' }),
    short: command_1.flags.boolean({ char: 'S', description: 'only output token' }),
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
    scope: command_1.flags.string({ char: 's', description: 'set custom OAuth scopes', completion: completions_1.ScopeCompletion }),
    'expires-in': command_1.flags.string({ char: 'e', description: 'set expiration in seconds (default no expiration)' }),
};
