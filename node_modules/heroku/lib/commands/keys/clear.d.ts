import { Command } from '@heroku-cli/command';
export default class Clear extends Command {
    static description: string;
    run(): Promise<void>;
}
