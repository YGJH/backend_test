import { Command } from '@heroku-cli/command';
import { Space } from '../../lib/types/fir';
declare type SpaceArray = Array<Required<Space>>;
export default class Index extends Command {
    static topic: string;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        team: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
    protected sortByName(spaces: SpaceArray): SpaceArray;
    protected displayJSON(spaces: SpaceArray): void;
    protected display(spaces: SpaceArray): void;
}
export {};
