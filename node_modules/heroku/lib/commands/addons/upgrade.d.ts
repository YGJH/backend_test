import { Command } from '@heroku-cli/command';
import type { Plan } from '@heroku-cli/schema';
export default class Upgrade extends Command {
    static aliases: string[];
    static topic: string;
    static description: string;
    static examples: string[];
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        addon: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
        plan: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    private parsed;
    run(): Promise<void>;
    protected getAddonPartsFromArgs(args: {
        addon: string;
        plan: string | undefined;
    }): {
        plan: string;
        addon: string;
    };
    protected buildNoPlanError(addon: string): string;
    protected buildApiErrorMessage(errorMessage: string, ctx: Awaited<typeof this.parsed>): string;
    protected getPlans(addonServiceName: string | undefined): Promise<Plan[]>;
}
