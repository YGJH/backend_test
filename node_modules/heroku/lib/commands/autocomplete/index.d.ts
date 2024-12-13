import { FlagInput } from '@oclif/core/lib/interfaces/parser';
import { AutocompleteBase } from '../../lib/autocomplete/base';
export default class Index extends AutocompleteBase {
    static description: string;
    static args: {
        shell: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: FlagInput;
    static examples: string[];
    run(): Promise<void>;
    private updateCache;
}
