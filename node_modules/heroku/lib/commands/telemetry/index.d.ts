import { Command } from '@heroku-cli/command';
import { TelemetryDrains } from '../../lib/types/telemetry';
export default class Index extends Command {
    static topic: string;
    static description: string;
    static flags: {
        space: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static example: string;
    run(): Promise<void>;
    protected display(telemetryDrains: TelemetryDrains, owner: string | undefined): void;
}
