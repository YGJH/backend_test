import { Command } from '@heroku-cli/command';
import { BackupTransfer } from '../../../lib/pg/types';
export default class Cancel extends Command {
    static topic: string;
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        backup_id: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    protected sortByCreatedAtDesc(transfers: BackupTransfer[]): BackupTransfer[];
}
