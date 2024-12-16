"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const peering_1 = require("../../../lib/spaces/peering");
const tsheredoc_1 = require("tsheredoc");
class Index extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Index);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default) `
          space required.
          USAGE: heroku spaces:peerings my-space
        `);
        }
        const { body: peerings } = await this.heroku.get(`/spaces/${spaceName}/peerings`);
        if (flags.json)
            (0, peering_1.displayPeeringsAsJSON)(peerings);
        else
            (0, peering_1.displayPeerings)(spaceName, peerings);
    }
}
exports.default = Index;
Index.topic = 'spaces';
Index.description = 'list peering connections for a space';
Index.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get peer list from' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Index.args = {
    space: core_1.Args.string({ hidden: true }),
};
