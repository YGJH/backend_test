import { Command } from '@heroku-cli/command';
export default class Errors extends Command {
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        hours: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        router: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        dyno: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
