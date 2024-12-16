import { Command } from '@heroku-cli/command';
export default class AppsTransfer extends Command {
    static topic: string;
    static description: string;
    static flags: {
        locked: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        bulk: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        confirm: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        recipient: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    static examples: string[];
    run(): Promise<void>;
}
