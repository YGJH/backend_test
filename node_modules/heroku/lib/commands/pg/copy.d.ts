import { Command } from '@heroku-cli/command';
export default class Copy extends Command {
    static topic: string;
    static description: string;
    static help: string;
    static flags: {
        'wait-interval': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        verbose: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        confirm: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        source: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        target: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
