import { PGSettingsCommand } from '../../../../lib/pg/setter';
import type { Setting, SettingKey } from '../../../../lib/pg/types';
export default class LogNestedStatements extends PGSettingsCommand {
    static description: string;
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: unknown): boolean;
    protected explain(setting: Setting<unknown>): "Nested statements will be included in execution plan logs." | "Only top-level execution plans will be included in logs.";
}
