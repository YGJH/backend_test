import { Command } from '@heroku-cli/command';
export default class Set extends Command {
    static topic: string;
    static aliases: string[];
    static hidden: boolean;
    static description: string;
    static flags: {
        space: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        url: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
