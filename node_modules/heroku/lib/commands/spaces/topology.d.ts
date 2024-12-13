import { Command } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
export declare type SpaceTopology = {
    version: number;
    apps: Array<{
        id?: string;
        domains: string[];
        formations: Array<{
            process_type: string;
            dynos: Array<{
                number: number;
                private_ip: string;
                hostname: string;
            }>;
        }>;
    }>;
};
export default class Topology extends Command {
    static topic: string;
    static description: string;
    static flags: {
        space: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        space: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    protected render(topology: SpaceTopology, appInfo: Heroku.App[], json: boolean): void;
    protected getProcessType(s: string): string;
    protected getProcessNum(s: string): number;
}
