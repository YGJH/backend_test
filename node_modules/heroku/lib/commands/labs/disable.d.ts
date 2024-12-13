import { Command } from '@heroku-cli/command';
import { FlagInput } from '@oclif/core/lib/interfaces/parser';
export default class LabsDisable extends Command {
    static description: string;
    static args: {
        feature: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    static flags: FlagInput;
    run(): Promise<void>;
    disableFeature(feature: string, app?: string): Promise<any>;
}
