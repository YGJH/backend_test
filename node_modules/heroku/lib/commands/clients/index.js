"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const { sortBy } = require('lodash');
class ClientsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(ClientsIndex);
        let { body: clients } = await this.heroku.get('/oauth/clients');
        clients = sortBy(clients, 'name');
        if (flags.json) {
            core_1.ux.styledJSON(clients);
        }
        else if (clients.length === 0) {
            core_1.ux.log('No OAuth clients.');
        }
        else {
            const printLine = (...args) => this.log(...args);
            core_1.ux.table(clients, {
                name: { get: (w) => color_1.default.green(w.name) },
                id: {},
                redirect_uri: {},
            }, { 'no-header': true, printLine });
        }
    }
}
exports.default = ClientsIndex;
ClientsIndex.description = 'list your OAuth clients';
ClientsIndex.flags = {
    json: command_1.flags.boolean({ char: 'j', name: 'json', description: 'output in json format' }),
};
