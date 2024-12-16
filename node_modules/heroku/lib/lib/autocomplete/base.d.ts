import Command from '@heroku-cli/command';
import { Completion } from '@oclif/core/lib/interfaces/parser';
export declare abstract class AutocompleteBase extends Command {
    errorIfWindows(): void;
    errorIfNotSupportedShell(shell: string): void;
    get autocompleteCacheDir(): string;
    get completionsCacheDir(): string;
    get acLogfilePath(): string;
    writeLogFile(msg: string): void;
    protected findCompletion(cmdId: string, name: string, description?: string): Completion | undefined;
}
