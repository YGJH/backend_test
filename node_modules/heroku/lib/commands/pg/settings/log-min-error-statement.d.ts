import { PGSettingsCommand } from '../../../lib/pg/setter';
import type { Setting, SettingKey } from '../../../lib/pg/types';
export default class LogMinErrorStatement extends PGSettingsCommand {
    static description: string;
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: string): string;
    protected explain(setting: Setting<string>): string;
}
