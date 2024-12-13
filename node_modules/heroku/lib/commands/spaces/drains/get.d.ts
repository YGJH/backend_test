import { Command } from '@heroku-cli/command';
export default class Get extends Command {
    static topic: string;
    static aliases: string[];
    static hidden: boolean;
    static description: string;
    static flags: {
        space: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
