"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class ClientsDestroy extends command_1.Command {
    async run() {
        const { args } = await this.parse(ClientsDestroy);
        core_1.ux.action.start(`Destroying ${color_1.default.cyan(args.id)}`);
        await this.heroku.delete(`/oauth/clients/${args.id}`);
        core_1.ux.action.stop();
    }
}
exports.default = ClientsDestroy;
ClientsDestroy.description = 'delete client by ID';
ClientsDestroy.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the OAuth client' }),
};
