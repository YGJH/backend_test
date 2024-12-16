import { Command } from '@heroku-cli/command';
export default class Remove extends Command {
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static example: string;
    static args: {
        url: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
