import { Command } from '@heroku-cli/command';
import { FlagInput } from '@oclif/core/lib/interfaces/parser';
export default class AuthToken extends Command {
    static description: string;
    static flags: FlagInput;
    run(): Promise<void>;
}
