"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const clients_1 = require("../../lib/clients/clients");
class ClientsCreate extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(ClientsCreate);
        const { redirect_uri, name } = args;
        (0, clients_1.validateURL)(redirect_uri);
        core_1.ux.action.start(`Creating ${name}`);
        const { body: client } = await this.heroku.post('/oauth/clients', {
            body: { name, redirect_uri },
        });
        core_1.ux.action.stop();
        if (flags.json) {
            core_1.ux.styledJSON(client);
        }
        else {
            core_1.ux.log(`HEROKU_OAUTH_ID=${client.id}`);
            core_1.ux.log(`HEROKU_OAUTH_SECRET=${client.secret}`);
        }
    }
}
exports.default = ClientsCreate;
ClientsCreate.description = 'create a new OAuth client';
ClientsCreate.examples = [
    '$ heroku clients:create "Amazing" https://amazing-client.herokuapp.com/auth/heroku/callback',
];
ClientsCreate.flags = {
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
    shell: command_1.flags.boolean({ char: 's', description: 'output in shell format' }),
};
ClientsCreate.args = {
    name: core_1.Args.string({ required: true, description: 'name of the OAuth client' }),
    redirect_uri: core_1.Args.string({ required: true, description: 'redirect URL of the OAuth client' }),
};
