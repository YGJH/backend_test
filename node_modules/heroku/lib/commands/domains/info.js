"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class DomainsInfo extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(DomainsInfo);
        const { body: res } = await this.heroku.get(`/apps/${flags.app}/domains/${args.hostname}`);
        const domain = Object.assign(Object.assign({}, res), { app: res.app && res.app.name });
        core_1.ux.styledObject(domain);
    }
}
exports.default = DomainsInfo;
DomainsInfo.description = 'show detailed information for a domain on an app';
DomainsInfo.examples = [
    '$ heroku domains:info www.example.com',
];
DomainsInfo.flags = {
    help: command_1.flags.help({ char: 'h' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
DomainsInfo.args = {
    hostname: core_1.Args.string({ required: true, description: 'unique identifier of the domain or full hostname' }),
};
