import { APIClient } from '@heroku-cli/command';
import { App } from '../types/fir';
export declare function isFirApp(appOrName: App | string, herokuApi?: APIClient): Promise<boolean>;
export declare function isCedarApp(appOrName: App | string, herokuApi?: APIClient): Promise<boolean>;
