import { Command } from '@heroku-cli/command';
export default class Transfer extends Command {
    static topic: string;
    static description: string;
    static examples: string[];
    static flags: {
        space: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        team: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
