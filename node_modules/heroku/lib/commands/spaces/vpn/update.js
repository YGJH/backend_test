"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const parsers_1 = require("../../../lib/spaces/parsers");
const tsheredoc_1 = require("tsheredoc");
class Update extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Update);
        const { space, cidrs } = flags;
        const { name } = args;
        const parsedCidrs = (0, parsers_1.splitCsv)(cidrs);
        core_1.ux.action.start(`Updating VPN Connection in space ${color_1.default.green(space)}`);
        await this.heroku.patch(`/spaces/${space}/vpn-connections/${name}`, { body: { routable_cidrs: parsedCidrs } });
        core_1.ux.action.stop();
    }
}
exports.default = Update;
Update.topic = 'spaces';
Update.description = (0, tsheredoc_1.default) `
    update VPN
    Private Spaces can be connected to another private network via an IPSec VPN connection allowing dynos to connect to hosts on your private networks and vice versa.
    The connection is established over the public Internet but all traffic is encrypted using IPSec.
  `;
Update.flags = {
    cidrs: command_1.flags.string({ char: 'c', description: 'a list of routable CIDRs separated by commas', required: true }),
    space: command_1.flags.string({ char: 's', description: 'space name', required: true }),
};
Update.example = (0, tsheredoc_1.default) `
    $ heroku spaces:vpn:update vpn-connection-name --space my-space --cidrs 172.16.0.0/16,10.0.0.0/24
    Updating VPN Connection in space my-space... done
  `;
Update.args = {
    name: core_1.Args.string({
        required: true,
        description: 'name or id of the VPN connection to update',
    }),
};
