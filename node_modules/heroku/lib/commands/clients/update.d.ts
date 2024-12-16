import { Command } from '@heroku-cli/command';
export default class ClientsUpdate extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        name: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        url: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        id: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
