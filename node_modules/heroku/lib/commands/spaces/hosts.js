"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const hosts_1 = require("../../lib/spaces/hosts");
class Hosts extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Hosts);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Error: Missing 1 required arg:
        space
        See more help with --help
      `));
        }
        const { body: hosts } = await this.heroku.get(`/spaces/${spaceName}/hosts`, {
            headers: { Accept: 'application/vnd.heroku+json; version=3.dogwood' },
        });
        if (flags.json)
            (0, hosts_1.displayHostsAsJSON)(hosts);
        else
            (0, hosts_1.displayHosts)(spaceName, hosts);
    }
}
exports.default = Hosts;
Hosts.topic = 'spaces';
Hosts.hidden = true;
Hosts.description = 'list dedicated hosts for a space';
Hosts.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get host list from' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Hosts.args = {
    space: core_1.Args.string({ hidden: true }),
};
