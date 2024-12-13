import { type Setting, type SettingKey } from '../../../lib/pg/types';
import { PGSettingsCommand } from '../../../lib/pg/setter';
export default class LogStatement extends PGSettingsCommand {
    static description: string;
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: string): string;
    protected explain(setting: Setting<string>): string;
}
