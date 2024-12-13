"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Accept extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Accept);
        const space = flags.space || args.space;
        if (!space) {
            throw new Error('Space name required.\nUSAGE: heroku spaces:peerings:accept pcx-12345678 --space my-space');
        }
        const pcxID = flags.pcxid || args.pcxid;
        await this.heroku.post(`/spaces/${space}/peerings`, {
            body: { pcx_id: pcxID },
            headers: { Accept: 'application/vnd.heroku+json; version=3.dogwood' },
        });
        core_1.ux.log(`Accepting and configuring peering connection ${color_1.default.cyan.bold(pcxID)}`);
    }
}
exports.default = Accept;
Accept.topic = 'spaces';
Accept.description = 'accepts a pending peering request for a private space';
Accept.examples = [(0, tsheredoc_1.default)(`
  $ heroku spaces:peerings:accept pcx-4bd27022 --space example-space
      Accepting and configuring peering connection pcx-4bd27022
  `)];
Accept.flags = {
    pcxid: command_1.flags.string({ char: 'p', description: 'PCX ID of a pending peering' }),
    space: command_1.flags.string({ char: 's', description: 'space to get peering info from' }),
};
Accept.args = {
    pcxid: core_1.Args.string({ hidden: true }),
    space: core_1.Args.string({ hidden: true }),
};
