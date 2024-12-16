import { Command } from '@heroku-cli/command';
export default class Debug extends Command {
    static description: string;
    static help: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'no-cache': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'no-setup': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        pipeline: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static topic: string;
    run(): Promise<void>;
}
