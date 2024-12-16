import { Command } from '@heroku-cli/command';
export default class Add extends Command {
    static description: string;
    static help: string;
    static example: string;
    static flags: {
        quiet: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        yes: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        key: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
