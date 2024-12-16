"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class ClientsInfo extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(ClientsInfo);
        const { body: client } = await this.heroku.get(`/oauth/clients/${args.id}`);
        if (flags.json) {
            core_1.ux.styledJSON(client);
        }
        else if (flags.shell) {
            core_1.ux.log(`HEROKU_OAUTH_ID=${client.id}`);
            core_1.ux.log(`HEROKU_OAUTH_SECRET=${client.secret}`);
        }
        else {
            core_1.ux.styledHeader(`${client.name}`);
            core_1.ux.styledObject(client);
        }
    }
}
exports.default = ClientsInfo;
ClientsInfo.description = 'show details of an oauth client';
ClientsInfo.examples = [
    '$ heroku clients:info 36120128-fee7-455e-8b7f-807aee130946',
];
ClientsInfo.flags = {
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
    shell: command_1.flags.boolean({ char: 's', description: 'output in shell format' }),
};
ClientsInfo.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the OAuth client' }),
};
