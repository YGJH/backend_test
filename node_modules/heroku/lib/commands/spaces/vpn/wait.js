"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const vpn_connections_1 = require("../../../lib/spaces/vpn-connections");
const tsheredoc_1 = require("tsheredoc");
const wait = (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});
class Wait extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Wait);
        const { space, json } = flags;
        const { name } = args;
        const interval = (flags.interval ? Number.parseInt(flags.interval, 10) : 10) * 1000;
        const timeout = (flags.timeout ? Number.parseInt(flags.timeout, 10) : 20 * 60) * 1000;
        const deadline = new Date(Date.now() + timeout);
        let { body: vpnConnection } = await this.heroku.get(`/spaces/${space}/vpn-connections/${name}`);
        if (vpnConnection.status === 'active') {
            core_1.ux.log('VPN has been allocated.');
            return;
        }
        core_1.ux.action.start(`Waiting for VPN Connection ${color_1.default.green(name)} to allocate...`);
        while (vpnConnection.status !== 'active') {
            if (new Date() > deadline) {
                core_1.ux.error('Timeout waiting for VPN to become allocated.', { exit: 1 });
            }
            if (vpnConnection.status === 'failed') {
                core_1.ux.error(vpnConnection.status_message || '', { exit: 1 });
            }
            await wait(interval);
            const { body: updatedVpnConnection } = await this.heroku.get(`/spaces/${space}/vpn-connections/${name}`);
            vpnConnection = updatedVpnConnection;
        }
        core_1.ux.action.stop();
        const { body: newVpnConnection } = await this.heroku.get(`/spaces/${space}/vpn-connections/${name}`);
        if (json) {
            core_1.ux.styledJSON(newVpnConnection);
        }
        else {
            (0, vpn_connections_1.displayVPNConfigInfo)(space, name, newVpnConnection);
        }
    }
}
exports.default = Wait;
Wait.topic = 'spaces';
Wait.description = 'wait for VPN Connection to be created';
Wait.examples = [(0, tsheredoc_1.default) `
      $ heroku spaces:vpn:wait vpn-connection-name --space my-space
      Waiting for VPN Connection vpn-connection-name to allocate... done
      === my-space VPN Tunnels

     VPN Tunnel Customer Gateway VPN Gateway    Pre-shared Key Routable Subnets IKE Version
     ────────── ──────────────── ────────────── ────────────── ──────────────── ───────────
     Tunnel 1    104.196.121.200   35.171.237.136  abcdef12345     10.0.0.0/16       1
     Tunnel 2    104.196.121.200   52.44.7.216     fedcba54321     10.0.0.0/16       1
    `];
Wait.flags = {
    space: command_1.flags.string({ char: 's', description: 'space the vpn connection belongs to', required: true }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
    interval: command_1.flags.string({ char: 'i', description: 'seconds to wait between poll intervals' }),
    timeout: command_1.flags.string({ char: 't', description: 'maximum number of seconds to wait' }),
};
Wait.args = {
    name: core_1.Args.string({
        description: 'name or id of the VPN connection you are waiting on for allocation.',
        required: true,
    }),
};
