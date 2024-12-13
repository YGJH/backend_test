import { Command } from '@heroku-cli/command';
import KolkrabbiAPI from '../../lib/pipelines/kolkrabbi-api';
interface AppInfo {
    name: string;
    repo?: string;
    hash?: string;
}
export default class PipelinesDiff extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    kolkrabbi: KolkrabbiAPI;
    getAppInfo: (appName: string, appId: string, generation: string) => Promise<AppInfo>;
    run(): Promise<undefined>;
}
export {};
