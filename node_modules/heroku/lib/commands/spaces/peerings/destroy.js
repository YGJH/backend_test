"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const confirmCommand_1 = require("../../../lib/confirmCommand");
class Destroy extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Destroy);
        const pcxID = flags.pcxid || args.pcxid;
        if (!pcxID) {
            core_1.ux.error((0, tsheredoc_1.default) `
        pcxid required.
        USAGE: heroku spaces:peering:destroy pcx-4bd27022
      `);
        }
        await (0, confirmCommand_1.default)(pcxID, flags.confirm, (0, tsheredoc_1.default)(`
      Destructive Action
      This command will attempt to destroy the peering connection ${color_1.default.bold.red(pcxID)}
    `));
        core_1.ux.action.start(`Tearing down peering connection ${color_1.default.cyan.bold(pcxID)}`);
        await this.heroku.delete(`/spaces/${flags.space}/peerings/${pcxID}`);
        core_1.ux.action.stop();
    }
}
exports.default = Destroy;
Destroy.topic = 'spaces';
Destroy.description = 'destroys an active peering connection in a private space';
Destroy.flags = {
    pcxid: command_1.flags.string({ char: 'p', description: 'PCX ID of a pending peering' }),
    space: command_1.flags.string({
        char: 's',
        description: 'space to get peering info from',
        required: true,
    }),
    confirm: command_1.flags.string({ description: 'set to PCX ID to bypass confirm prompt' }),
};
Destroy.args = {
    pcxid: core_1.Args.string({ hidden: true }),
};
Destroy.example = (0, tsheredoc_1.default)(`
    $ heroku spaces:peerings:destroy pcx-4bd27022 --confirm pcx-4bd27022 --space example-space
    Tearing down peering connection pcx-4bd27022... done
  `);
