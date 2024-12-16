import { Command } from '@heroku-cli/command';
export default class Info extends Command {
    static topic: string;
    static description: string;
    static args: {
        telemetry_drain_id: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    static example: string;
    run(): Promise<void>;
}
