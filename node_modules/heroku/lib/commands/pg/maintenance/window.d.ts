import { Command } from '@heroku-cli/command';
export default class Window extends Command {
    static topic: string;
    static description: string;
    static example: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        window: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
