import { Command } from '@heroku-cli/command';
export default class ClientsDestroy extends Command {
    static description: string;
    static args: {
        id: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
