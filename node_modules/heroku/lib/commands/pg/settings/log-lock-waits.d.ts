import { PGSettingsCommand } from '../../../lib/pg/setter';
import type { Setting, SettingKey } from '../../../lib/pg/types';
export default class LogLockWaits extends PGSettingsCommand {
    static topic: string;
    static description: string;
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: unknown): boolean;
    protected explain(setting: Setting<unknown>): "When a deadlock is detected, a log message will be emitted in your application's logs." | "When a deadlock is detected, no log message will be emitted in your application's logs.";
}
