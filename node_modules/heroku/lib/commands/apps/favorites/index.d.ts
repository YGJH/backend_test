import { Command } from '@heroku-cli/command';
export default class Index extends Command {
    static description: string;
    static topic: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
