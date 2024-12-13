import { Command } from '@heroku-cli/command';
import { TelemetryDrain } from '../../lib/types/telemetry';
export default class Remove extends Command {
    static topic: string;
    static description: string;
    static args: {
        telemetry_drain_id: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        space: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
    protected removeDrain(telemetry_drain_id: string): Promise<TelemetryDrain>;
}
