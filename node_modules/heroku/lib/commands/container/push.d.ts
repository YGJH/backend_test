import { Command } from '@heroku-cli/command';
export default class Push extends Command {
    static topic: string;
    static description: string;
    static strict: boolean;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        verbose: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        recursive: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        arg: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'context-path': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static examples: string[];
    run(): Promise<void>;
}
