"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const authorizations_1 = require("../../lib/authorizations/authorizations");
class AuthorizationsUpdate extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(AuthorizationsUpdate);
        core_1.ux.action.start('Updating OAuth Authorization');
        let client;
        if (flags['client-id']) {
            client = {
                id: flags['client-id'],
                secret: flags['client-secret'],
            };
        }
        const { body: authentication } = await this.heroku.patch(`/oauth/authorizations/${args.id}`, {
            body: {
                description: flags.description,
                client,
            },
        });
        core_1.ux.action.stop();
        (0, authorizations_1.display)(authentication);
    }
}
exports.default = AuthorizationsUpdate;
AuthorizationsUpdate.description = 'updates an OAuth authorization';
AuthorizationsUpdate.flags = {
    description: command_1.flags.string({ char: 'd', description: 'set a custom authorization description' }),
    'client-id': command_1.flags.string({ description: 'identifier of OAuth client to set', dependsOn: ['client-secret'] }),
    'client-secret': command_1.flags.string({ description: 'secret of OAuth client to set', dependsOn: ['client-id'] }),
};
AuthorizationsUpdate.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the authorization' }),
};
