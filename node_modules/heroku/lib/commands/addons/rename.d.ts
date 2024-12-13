import { Command } from '@heroku-cli/command';
export default class Rename extends Command {
    static topic: string;
    static description: string;
    static args: {
        addon_name: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        new_name: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
