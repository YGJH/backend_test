import { Command } from '@heroku-cli/command';
export default class Setup extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        team: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        yes: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        name: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        repo: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
