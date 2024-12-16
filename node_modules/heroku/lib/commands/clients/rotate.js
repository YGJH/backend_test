"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class ClientsRotate extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(ClientsRotate);
        core_1.ux.action.start(`Updating ${color_1.default.cyan(args.id)}`);
        const { body: client } = await this.heroku.post(`/oauth/clients/${encodeURIComponent(args.id)}/actions/rotate-credentials`);
        core_1.ux.action.stop();
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
exports.default = ClientsRotate;
ClientsRotate.description = 'rotate OAuth client secret';
ClientsRotate.flags = {
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
    shell: command_1.flags.boolean({ char: 's', description: 'output in shell format' }),
};
ClientsRotate.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the OAuth client' }),
};
