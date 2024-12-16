"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const clients_1 = require("../../lib/clients/clients");
const isEmpty = (o) => Object.keys(o).length === 0;
const getUpdates = (flags) => {
    const updates = {};
    if (flags.url)
        updates.redirect_uri = (0, clients_1.validateURL)(flags.url);
    if (flags.name)
        updates.name = flags.name;
    return updates;
};
class ClientsUpdate extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(ClientsUpdate);
        const body = getUpdates(flags);
        if (isEmpty(body))
            this.error('No changes provided.');
        core_1.ux.action.start(`Updating ${color_1.default.cyan(args.id)}`);
        await this.heroku.patch(`/oauth/clients/${encodeURIComponent(args.id)}`, { body });
        core_1.ux.action.stop();
    }
}
exports.default = ClientsUpdate;
ClientsUpdate.description = 'update OAuth client';
ClientsUpdate.examples = [
    '$ heroku clients:update 3e304bda-d376-4278-bdea-6d6c08aa1359 --url https://amazing-client.herokuapp.com/auth/heroku/callback',
];
ClientsUpdate.flags = {
    name: command_1.flags.string({ char: 'n', description: 'change the client name' }),
    url: command_1.flags.string({ description: 'change the client redirect URL' }),
};
ClientsUpdate.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the OAuth client' }),
};
