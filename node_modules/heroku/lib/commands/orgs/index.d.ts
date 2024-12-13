import { Command } from '@heroku-cli/command';
export default class OrgsIndex extends Command {
    static topic: string;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        enterprise: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        teams: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
