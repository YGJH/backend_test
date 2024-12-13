import { FlagInput } from '@oclif/core/lib/interfaces/parser';
import { AutocompleteBase } from '../../lib/autocomplete/base';
export default class Doctor extends AutocompleteBase {
    static hidden: boolean;
    static description: string;
    static args: {
        shell: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: FlagInput;
    run(): Promise<void>;
    private printList;
}
