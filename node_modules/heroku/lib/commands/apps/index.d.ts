import { Command } from '@heroku-cli/command';
export default class AppsIndex extends Command {
    static description: string;
    static topic: string;
    static hiddenAliases: string[];
    static examples: string[];
    static flags: {
        all: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        space: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        personal: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'internal-routing': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        team: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
