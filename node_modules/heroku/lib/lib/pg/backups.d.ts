import { APIClient } from '@heroku-cli/command';
import type { BackupTransfer } from './types';
declare class Backups {
    protected app: string;
    protected heroku: APIClient;
    protected logsAlreadyShown: Set<string>;
    constructor(app: string, heroku: APIClient);
    filesize(size: number, opts?: {}): string;
    status: (transfer: BackupTransfer) => string;
    num: (name: string) => Promise<number | undefined>;
    name: (transfer: BackupTransfer) => string;
    wait: (action: string, transferID: string, interval: number, verbose: boolean, app: string) => Promise<void>;
    protected displayLogs(logs: BackupTransfer['logs']): void;
    protected poll(transferID: string, interval: number, verbose: boolean, appId: string): AsyncGenerator<unknown, void, unknown>;
}
declare function factory(app: string, heroku: APIClient): Backups;
export default factory;
