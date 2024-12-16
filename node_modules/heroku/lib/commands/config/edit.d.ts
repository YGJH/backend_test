import { Command } from '@heroku-cli/command';
interface Config {
    [key: string]: string;
}
export declare function stringToConfig(s: string): Config;
export default class ConfigEdit extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        key: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    app: string;
    run(): Promise<void>;
    private fetchLatestConfig;
    private diffPrompt;
    private verifyUnchanged;
    private updateConfig;
}
export {};
