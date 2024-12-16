import { Command } from '@heroku-cli/command';
export default class Generate extends Command {
    static topic: string;
    static description: string;
    static help: string;
    static flags: {
        selfsigned: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        keysize: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        owner: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        country: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        area: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        city: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        subject: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        now: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        domain: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    private parsed;
    run(): Promise<void>;
    protected requiresPrompt(flags: Awaited<typeof this.parsed>['flags']): boolean | undefined;
    protected getSubject(args: Awaited<typeof this.parsed>['args'], flags: Awaited<typeof this.parsed>['flags']): string;
    protected spawnOpenSSL(args: ReadonlyArray<string>): Promise<unknown>;
}
