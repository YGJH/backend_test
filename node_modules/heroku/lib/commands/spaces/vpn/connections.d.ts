import { Command } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
declare type VpnConnectionTunnels = Required<Heroku.PrivateSpacesVpn>['tunnels'];
export default class Connections extends Command {
    static topic: string;
    static description: string;
    static example: string;
    static flags: {
        space: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
    protected render(space: string, connections: Required<Heroku.PrivateSpacesVpn>[], json: boolean): void;
    protected displayVPNConnections(space: string, connections: Required<Heroku.PrivateSpacesVpn>[]): void;
    protected tunnelFormat(t: VpnConnectionTunnels): string;
}
export {};
