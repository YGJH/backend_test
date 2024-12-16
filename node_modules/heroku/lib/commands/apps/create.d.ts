import { Command } from '@heroku-cli/command';
import { Interfaces } from '@oclif/core';
export default class Create extends Command {
    static description: string;
    static hiddenAliases: string[];
    static examples: string[];
    static args: {
        app: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        app: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        addons: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        buildpack: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        manifest: Interfaces.BooleanFlag<boolean>;
        'no-remote': Interfaces.BooleanFlag<boolean>;
        remote: Interfaces.OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        stack: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        space: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        region: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        'internal-routing': Interfaces.BooleanFlag<boolean>;
        features: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        kernel: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        locked: Interfaces.BooleanFlag<boolean>;
        json: Interfaces.BooleanFlag<boolean>;
        team: Interfaces.OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
