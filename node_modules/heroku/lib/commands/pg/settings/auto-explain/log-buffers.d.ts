import { BooleanAsString, PGSettingsCommand } from '../../../../lib/pg/setter';
import { Setting, SettingKey } from '../../../../lib/pg/types';
export default class LogBuffersWaits extends PGSettingsCommand {
    static topic: string;
    static description: string;
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: BooleanAsString): boolean;
    protected explain(setting: Setting<boolean>): "Buffer statistics have been enabled for auto_explain." | "Buffer statistics have been disabled for auto_explain.";
}
