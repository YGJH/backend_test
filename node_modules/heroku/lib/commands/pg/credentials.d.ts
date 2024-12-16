import { Command } from '@heroku-cli/command';
import { CredentialInfo, CredentialsInfo } from '../../lib/pg/types';
export default class Credentials extends Command {
    static topic: string;
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        database: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    protected sortByDefaultAndName(credentials: CredentialsInfo): CredentialsInfo;
    protected isDefaultCredential(cred: CredentialInfo): boolean;
}
