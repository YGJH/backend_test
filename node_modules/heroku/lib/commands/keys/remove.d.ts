import { Command } from '@heroku-cli/command';
export default class Remove extends Command {
    static description: string;
    static example: string;
    static args: {
        key: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
