import { Command } from '@heroku-cli/command';
export default class ReviewappsEnable extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        pipeline: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        autodeploy: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        autodestroy: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'wait-for-ci': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
