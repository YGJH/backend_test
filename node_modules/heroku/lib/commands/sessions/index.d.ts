import { Command } from '@heroku-cli/command';
export default class SessionsIndex extends Command {
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
