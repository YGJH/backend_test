"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
class Destroy extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Destroy);
        const { space, confirm } = flags;
        const { name } = args;
        await (0, confirmCommand_1.default)(name, confirm, (0, tsheredoc_1.default) `
        Destructive Action
        This command will attempt to destroy the specified VPN Connection in space ${color_1.default.green(space)}
      `);
        core_1.ux.action.start(`Tearing down VPN Connection ${color_1.default.cyan(name)} in space ${color_1.default.cyan(space)}`);
        await this.heroku.delete(`/spaces/${space}/vpn-connections/${name}`);
        core_1.ux.action.stop();
    }
}
exports.default = Destroy;
Destroy.topic = 'spaces';
Destroy.description = 'destroys VPN in a private space';
Destroy.examples = [(0, tsheredoc_1.default) `
    $ heroku spaces:vpn:destroy vpn-connection-name --space example-space --confirm vpn-connection-name
    Tearing down VPN Connection vpn-connection-name in space example-space
  `];
Destroy.flags = {
    space: command_1.flags.string({ char: 's', description: 'space name', required: true }),
    confirm: command_1.flags.string({ description: 'set to VPN connection name to bypass confirm prompt', hidden: true }),
};
Destroy.args = {
    name: core_1.Args.string({
        required: true,
        description: 'name or id of the VPN connection to destroy',
    }),
};
