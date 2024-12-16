import { PGSettingsCommand, BooleanAsString } from '../../../../lib/pg/setter';
import { SettingKey, Setting } from '../../../../lib/pg/types';
export default class LogTriggers extends PGSettingsCommand {
    static topic: string;
    static description: string;
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: BooleanAsString): boolean;
    protected explain(setting: Setting<boolean>): "Trigger execution statistics have been enabled for auto-explain." | "Trigger execution statistics have been disabled for auto-explain.";
}
