"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const peering_1 = require("../../../lib/spaces/peering");
class Info extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Info);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Error: Missing 1 required arg:
        space
        See more help with --help
      `));
        }
        const { body: pInfo } = await this.heroku.get(`/spaces/${spaceName}/peering-info`);
        if (flags.json)
            core_1.ux.log(JSON.stringify(pInfo, null, 2));
        else
            (0, peering_1.displayPeeringInfo)(spaceName, pInfo);
    }
}
exports.default = Info;
Info.topic = 'spaces';
Info.hiddenAliases = ['spaces:peering:info'];
Info.description = (0, tsheredoc_1.default)(`
    display the information necessary to initiate a peering connection

    You will use the information provided by this command to establish a peering connection request from your AWS VPC to your private space.

    To start the peering process, go into your AWS console for the VPC you would like peered with your Private Space,
    navigate to the VPC service, choose the "Peering Connections" option and click the "Create peering connection" button.

    - The AWS Account ID and VPC ID are necessary for the AWS VPC Peering connection wizard.
    - You will also need to configure your VPC route table to route the Dyno CIDRs through the peering connection.

    Once you've established the peering connection request, you can use the spaces:peerings:accept command to accept and
    configure the peering connection for the space.
  `);
Info.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get peering info from' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Info.examples = [(0, tsheredoc_1.default)(`
    $ heroku spaces:peering:info example-space
    === example-space  Peering Info

    AWS Account ID:    012345678910
    AWS Region:        us-west-2
    AWS VPC ID:        vpc-baadf00d
    AWS VPC CIDR:      10.0.0.0/16
    Space CIDRs:       10.0.128.0/20, 10.0.144.0/20
    Unavailable CIDRs: 10.1.0.0/16
  `)];
Info.args = {
    space: core_1.Args.string({ hidden: true }),
};
