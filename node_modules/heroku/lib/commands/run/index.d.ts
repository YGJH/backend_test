import { Command } from '@heroku-cli/command';
export default class Run extends Command {
    static description: string;
    static examples: string[];
    static strict: boolean;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        size: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        type: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'exit-code': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        env: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'no-tty': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        listen: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'no-notify': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
