"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const format_1 = require("../../../lib/spaces/format");
class Info extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Info);
        const { space, json } = flags;
        const { name } = args;
        const { body: vpnConnection } = await this.heroku.get(`/spaces/${space}/vpn-connections/${name}`);
        const connectionName = vpnConnection.name || name;
        this.render(connectionName, vpnConnection, json);
    }
    displayVPNInfo(name, vpnConnection) {
        core_1.ux.styledHeader(`${name} VPN Info`);
        core_1.ux.styledObject({
            Name: name,
            ID: vpnConnection.id,
            'Public IP': vpnConnection.public_ip,
            'Routable CIDRs': (0, format_1.displayCIDR)(vpnConnection.routable_cidrs),
            Status: `${(0, format_1.displayVPNStatus)(vpnConnection.status)}`,
            'Status Message': vpnConnection.status_message,
        }, ['Name', 'ID', 'Public IP', 'Routable CIDRs', 'State', 'Status', 'Status Message']);
        const vpnConnectionTunnels = vpnConnection.tunnels || [];
        vpnConnectionTunnels.forEach((val, i) => {
            val.tunnel_id = 'Tunnel ' + (i + 1);
        });
        core_1.ux.styledHeader(`${name} VPN Tunnel Info`);
        core_1.ux.table(vpnConnectionTunnels, {
            tunnel_id: { header: 'VPN Tunnel' },
            ip: { header: 'IP Address' },
            status: {
                header: 'Status',
                get: row => (0, format_1.displayVPNStatus)(row.status),
            },
            last_status_change: { header: 'Status Last Changed' },
            status_message: { header: 'Details' },
        });
    }
    render(name, vpnConnection, json) {
        if (json) {
            core_1.ux.styledJSON(vpnConnection);
        }
        else {
            this.displayVPNInfo(name, vpnConnection);
        }
    }
}
exports.default = Info;
Info.topic = 'spaces';
Info.description = 'display the information for VPN';
Info.example = (0, tsheredoc_1.default)(`
    $ heroku spaces:vpn:info vpn-connection-name --space my-space
    === vpn-connection-name VPN Tunnel Info
    Name:           vpn-connection-name
    ID:             123456789012
    Public IP:      35.161.69.30
    Routable CIDRs: 172.16.0.0/16
    Status:         failed
    Status Message: supplied CIDR block already in use
    === my-space Tunnel Info
     VPN Tunnel IP Address    Status Last Changed         Details
     ────────── ───────────── ────── ──────────────────── ─────────────
     Tunnel 1   52.44.146.197 UP     2016-10-25T22:09:05Z status message
     Tunnel 2   52.44.146.197 UP     2016-10-25T22:09:05Z status message
  `);
Info.flags = {
    space: command_1.flags.string({
        char: 's',
        description: 'space the vpn connection belongs to',
        required: true,
    }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Info.args = {
    name: core_1.Args.string({
        description: 'name or id of the VPN connection to get info from',
        required: true,
    }),
};
