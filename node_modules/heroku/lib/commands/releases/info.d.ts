import { Command } from '@heroku-cli/command';
export default class Info extends Command {
    static topic: string;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        shell: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        release: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
