import { Command } from '@heroku-cli/command';
export default class AuthorizationsRevoke extends Command {
    static description: string;
    static aliases: string[];
    static examples: string[];
    static args: {
        id: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
