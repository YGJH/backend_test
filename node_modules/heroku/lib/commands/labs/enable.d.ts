import { Command } from '@heroku-cli/command';
export default class LabsEnable extends Command {
    static description: string;
    static topic: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        feature: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
