import { Command } from '@heroku-cli/command';
export default class Plans extends Command {
    static topic: string;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        service: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
