import { Command } from '@heroku-cli/command';
import { ConnectionDetails } from '../../lib/pg/util';
export default class Push extends Command {
    static topic: string;
    static description: string;
    static examples: string[];
    static flags: {
        'exclude-table-data': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        source: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        target: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
    protected push(sourceIn: ConnectionDetails, targetIn: ConnectionDetails, exclusions: string[]): Promise<void>;
}
