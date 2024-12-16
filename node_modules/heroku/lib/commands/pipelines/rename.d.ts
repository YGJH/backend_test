import { Command } from '@heroku-cli/command';
export default class PipelinesRename extends Command {
    static description: string;
    static examples: string[];
    static args: {
        pipeline: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        name: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
