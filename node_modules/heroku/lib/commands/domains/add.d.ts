import { Command } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
export default class DomainsAdd extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        cert: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        wait: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        hostname: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    certSelect: (certs: Array<Heroku.SniEndpoint>) => Promise<string>;
    run(): Promise<void>;
}
