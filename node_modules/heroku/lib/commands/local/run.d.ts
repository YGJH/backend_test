import { Command } from '@oclif/core';
export default class Run extends Command {
    static description: string;
    static examples: string[];
    static strict: boolean;
    static flags: {
        env: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        port: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
