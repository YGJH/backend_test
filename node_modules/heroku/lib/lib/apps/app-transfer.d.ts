import { APIClient } from '@heroku-cli/command';
declare type Options = {
    heroku: APIClient;
    appName: string;
    recipient: string;
    personalToPersonal: boolean;
    bulk: boolean;
};
export declare const appTransfer: (options: Options) => Promise<void>;
export {};
