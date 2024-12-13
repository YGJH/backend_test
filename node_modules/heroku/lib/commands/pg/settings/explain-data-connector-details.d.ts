import { type BooleanAsString, PGSettingsCommand } from '../../../lib/pg/setter';
import type { Setting, SettingKey } from '../../../lib/pg/types';
export default class ExplainDataConnectorDetails extends PGSettingsCommand {
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    protected settingKey: SettingKey;
    protected convertValue(val: BooleanAsString): boolean;
    protected explain(setting: Setting<boolean>): string;
}
