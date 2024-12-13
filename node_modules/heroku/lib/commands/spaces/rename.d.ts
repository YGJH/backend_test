import { Command } from '@heroku-cli/command';
export default class Rename extends Command {
    static topic: string;
    static description: string;
    static example: string;
    static flags: {
        from: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        to: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
