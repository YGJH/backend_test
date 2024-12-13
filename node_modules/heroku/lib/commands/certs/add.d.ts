import { Command } from '@heroku-cli/command';
export default class Add extends Command {
    static topic: string;
    static strict: boolean;
    static description: string;
    static examples: string[];
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        CRT: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        KEY: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
