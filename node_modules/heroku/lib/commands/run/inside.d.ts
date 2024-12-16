import { Command } from '@heroku-cli/command';
export default class RunInside extends Command {
    static description: string;
    static strict: boolean;
    static args: {
        dyno_name: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        command: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'exit-code': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        listen: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'no-launcher': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static examples: string[];
    run(): Promise<void>;
}
