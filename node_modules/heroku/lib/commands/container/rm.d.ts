import { Command } from '@heroku-cli/command';
export default class Rm extends Command {
    static topic: string;
    static description: string;
    static usage: string;
    static example: string;
    static strict: boolean;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
