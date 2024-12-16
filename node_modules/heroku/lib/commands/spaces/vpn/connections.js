"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const format_1 = require("../../../lib/spaces/format");
class Connections extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Connections);
        const { space, json } = flags;
        const { body: connections } = await this.heroku.get(`/spaces/${space}/vpn-connections`);
        this.render(space, connections, json);
    }
    render(space, connections, json) {
        if (json) {
            core_1.ux.styledJSON(connections);
        }
        else {
            this.displayVPNConnections(space, connections);
        }
    }
    displayVPNConnections(space, connections) {
        if (connections.length === 0) {
            core_1.ux.log('No VPN Connections have been created yet');
            return;
        }
        core_1.ux.styledHeader(`${space} VPN Connections`);
        core_1.ux.table(connections, {
            Name: {
                get: c => c.name || c.id,
            },
            Status: {
                get: c => (0, format_1.displayVPNStatus)(c.status),
            },
            Tunnels: {
                get: c => this.tunnelFormat(c.tunnels),
            },
        });
    }
    tunnelFormat(t) {
        return t.map(tunnel => (0, format_1.displayVPNStatus)(tunnel.status)).join('/');
    }
}
exports.default = Connections;
Connections.topic = 'spaces';
Connections.description = 'list the VPN Connections for a space';
Connections.example = (0, tsheredoc_1.default) `
    $ heroku spaces:vpn:connections --space my-space
    === my-space VPN Connections
     Name   Status Tunnels 
     ────── ────── ─────── 
     office active UP/UP   
  `;
Connections.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get VPN connections from', required: true }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
