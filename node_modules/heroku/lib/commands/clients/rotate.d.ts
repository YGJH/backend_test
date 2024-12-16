import { Command } from '@heroku-cli/command';
export default class ClientsRotate extends Command {
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        shell: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        id: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
