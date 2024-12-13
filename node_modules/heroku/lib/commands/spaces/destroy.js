"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const tsheredoc_1 = require("tsheredoc");
const confirmCommand_1 = require("../../lib/confirmCommand");
const spaces_1 = require("../../lib/spaces/spaces");
class Destroy extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Destroy);
        const { confirm } = flags;
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default) `
        Space name required.
        USAGE: heroku spaces:destroy my-space
      `);
        }
        let natWarning = '';
        const { body: space } = await this.heroku.get(`/spaces/${spaceName}`);
        if (space.state === 'allocated') {
            ({ body: space.outbound_ips } = await this.heroku.get(`/spaces/${spaceName}/nat`));
            if (space.outbound_ips && space.outbound_ips.state === 'enabled') {
                natWarning = `The Outbound IPs for this space will be reused!\nEnsure that external services no longer allow these Outbound IPs: ${(0, spaces_1.displayNat)(space.outbound_ips)}\n`;
            }
        }
        await (0, confirmCommand_1.default)(spaceName, confirm, `Destructive Action\nThis command will destroy the space ${color_1.default.bold.red(spaceName)}\n${natWarning}\n`);
        core_1.ux.action.start(`Destroying space ${color_1.default.cyan(spaceName)}`);
        await this.heroku.delete(`/spaces/${spaceName}`);
        core_1.ux.action.stop();
    }
}
exports.default = Destroy;
Destroy.topic = 'spaces';
Destroy.description = (0, tsheredoc_1.default) `
    destroy a space
  `;
Destroy.examples = [(0, tsheredoc_1.default) `
    $ heroku spaces:destroy --space my-space
    Destroying my-space... done
  `];
Destroy.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to destroy' }),
    confirm: command_1.flags.string({ description: 'set to space name to bypass confirm prompt', hasValue: true }),
};
Destroy.args = {
    space: core_1.Args.string({ hidden: true }),
};
