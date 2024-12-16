import { AutocompleteBase } from '../../lib/autocomplete/base';
export default class Script extends AutocompleteBase {
    static description: string;
    static hidden: boolean;
    static args: {
        shell: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    private get prefix();
}
