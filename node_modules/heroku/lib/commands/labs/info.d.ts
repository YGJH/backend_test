import { Command } from '@heroku-cli/command';
export default class LabsInfo extends Command {
    static description: string;
    static topic: string;
    static args: {
        feature: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
