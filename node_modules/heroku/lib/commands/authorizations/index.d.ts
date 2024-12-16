import { Command } from '@heroku-cli/command';
export default class AuthorizationsIndex extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
