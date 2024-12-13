import { AutocompleteBase } from '../../lib/autocomplete/base';
export default class Options extends AutocompleteBase {
    static hidden: boolean;
    static description: string;
    static flags: {
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        completion: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    parsedArgs: {
        [name: string]: string;
    };
    parsedFlags: {
        [name: string]: string;
    };
    run(): Promise<void>;
    private processCommandLine;
    private determineCompletion;
    private fetchOptions;
    private parsedFlagsWithEnvVars;
    private throwError;
    private findFlagFromWildArg;
    private determineCmdState;
}
