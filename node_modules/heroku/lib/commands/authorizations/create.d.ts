import { Command } from '@heroku-cli/command';
export default class AuthorizationsCreate extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        description: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        short: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        scope: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'expires-in': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
