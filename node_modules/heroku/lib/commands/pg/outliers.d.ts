import { Command } from '@heroku-cli/command';
import { getConnectionDetails } from '../../lib/pg/util';
export default class Outliers extends Command {
    static topic: string;
    static description: string;
    static flags: {
        reset: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        truncate: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        num: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    protected ensurePGStatStatement(db: ReturnType<typeof getConnectionDetails>): Promise<void>;
    protected outliersQuery(version: string | undefined, limit: number, truncate: boolean): string;
}
