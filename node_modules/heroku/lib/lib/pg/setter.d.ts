import { Command } from '@heroku-cli/command';
import { SettingKey, Setting } from './types';
export declare abstract class PGSettingsCommand extends Command {
    protected abstract settingKey: SettingKey;
    protected abstract convertValue(val: string): unknown;
    protected abstract explain(setting: Setting<unknown>): string;
    static topic: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
export declare type BooleanAsString = 'on' | 'ON' | 'true' | 'TRUE' | 'off' | 'OFF' | 'false' | 'FALSE';
export declare const booleanConverter: (value: BooleanAsString) => boolean;
export declare const numericConverter: (value: string) => number;
