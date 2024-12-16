import { Command } from '@heroku-cli/command';
export default class Enable extends Command {
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        min: import("@oclif/core/lib/interfaces").OptionFlag<number, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        max: import("@oclif/core/lib/interfaces").OptionFlag<number, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        p95: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        notifications: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
