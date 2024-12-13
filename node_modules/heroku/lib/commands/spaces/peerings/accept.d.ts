import { Command } from '@heroku-cli/command';
export default class Accept extends Command {
    static topic: string;
    static description: string;
    static examples: string[];
    static flags: {
        pcxid: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        space: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        pcxid: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        space: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
