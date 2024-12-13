import { Command } from '@heroku-cli/command';
export default class ContainerIndex extends Command {
    static description: string;
    static topic: string;
    run(): Promise<void>;
}
