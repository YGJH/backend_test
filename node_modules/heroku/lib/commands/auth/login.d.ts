import { Command } from '@heroku-cli/command';
import { FlagInput } from '@oclif/core/lib/interfaces/parser';
export default class Login extends Command {
    static description: string;
    static aliases: string[];
    static flags: FlagInput;
    run(): Promise<void>;
}
