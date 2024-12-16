import { Command } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
export declare function renderAttachment(attachment: Heroku.AddOnAttachment, app: string, isFirst?: boolean): string;
export default class Addons extends Command {
    static topic: string;
    static usage: string;
    static description: string;
    static flags: {
        all: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static examples: string[];
    run(): Promise<void>;
}
