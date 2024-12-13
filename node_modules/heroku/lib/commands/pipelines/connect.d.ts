import { Command } from '@heroku-cli/command';
export default class Connect extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        repo: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        name: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
