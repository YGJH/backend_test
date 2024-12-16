import { Command } from '@heroku-cli/command';
export default class AppsInfo extends Command {
    static description: string;
    static topic: string;
    static hiddenAliases: string[];
    static examples: string[];
    static help: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        shell: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        extended: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        app: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
