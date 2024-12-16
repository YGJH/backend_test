import { Command } from '@heroku-cli/command';
export default class PipelinesInfo extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'with-owners': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        pipeline: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
