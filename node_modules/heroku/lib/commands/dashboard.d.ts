import { Command } from '@heroku-cli/command';
export default class Dashboard extends Command {
    static topic: string;
    static description: string;
    static hidden: boolean;
    run(): Promise<void>;
}
