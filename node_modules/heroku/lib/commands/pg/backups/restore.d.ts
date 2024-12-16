import { Command } from '@heroku-cli/command';
export default class Restore extends Command {
    static topic: string;
    static description: string;
    static flags: {
        'wait-interval': import("@oclif/core/lib/interfaces").OptionFlag<number, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        extensions: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        verbose: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        confirm: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        backup: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    static examples: string[];
    run(): Promise<void>;
    protected getSortedExtensions(extensions: string | null | undefined): string[] | undefined;
}
