import { Command } from '@heroku-cli/command';
export default class CiMigrateManifest extends Command {
    static description: string;
    static topic: string;
    static examples: string[];
    run(): Promise<void>;
}
