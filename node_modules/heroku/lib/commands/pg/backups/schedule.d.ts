import { Command } from '@heroku-cli/command';
declare type BackupSchedule = {
    hour: string;
    timezone: string;
    schedule_name?: string;
};
export default class Schedule extends Command {
    static topic: string;
    static description: string;
    static flags: {
        at: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    parseDate: (at: string) => BackupSchedule;
    run(): Promise<void>;
}
export {};
