"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const parsers_1 = require("../../../lib/spaces/parsers");
class Connect extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Connect);
        const { space, cidrs, ip } = flags;
        const { name } = args;
        const parsed_cidrs = (0, parsers_1.splitCsv)(cidrs);
        core_1.ux.action.start(`Creating VPN Connection in space ${color_1.default.green(space)}`);
        await this.heroku.post(`/spaces/${space}/vpn-connections`, {
            body: {
                name,
                public_ip: ip,
                routable_cidrs: parsed_cidrs,
            },
        });
        core_1.ux.action.stop();
        core_1.ux.warn(`Use ${color_1.default.cmd('heroku spaces:vpn:wait')} to track allocation.`);
    }
}
exports.default = Connect;
Connect.topic = 'spaces';
Connect.description = (0, tsheredoc_1.default) `
    create VPN
    Private Spaces can be connected to another private network via an IPSec VPN connection allowing dynos to connect to hosts on your private networks and vice versa.
    The connection is established over the public Internet but all traffic is encrypted using IPSec.
  `;
Connect.examples = [(0, tsheredoc_1.default) `
    $ heroku spaces:vpn:connect vpn-connection-name --ip 35.161.69.30 --cidrs 172.16.0.0/16,10.0.0.0/24 --space my-space
    Creating VPN Connection in space my-space... done
    ▸    Use spaces:vpn:wait to track allocation.
  `];
Connect.flags = {
    ip: command_1.flags.string({ char: 'i', description: 'public IP of customer gateway', required: true }),
    cidrs: command_1.flags.string({ char: 'c', description: 'a list of routable CIDRs separated by commas', required: true }),
    space: command_1.flags.string({ char: 's', description: 'space name', required: true }),
};
Connect.args = {
    name: core_1.Args.string({
        required: true,
        description: 'name or id of the VPN connection to create',
    }),
};
