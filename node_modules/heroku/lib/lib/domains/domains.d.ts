import { APIClient } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
export declare function getDomains(heroku: APIClient, app: string): Promise<Required<Heroku.Domain>[]>;
export declare function waitForDomains(heroku: APIClient, app: string): Promise<Required<Heroku.Domain>[]>;
export declare function printDomains(domains: Required<Heroku.Domain>[], message: string): void;
export declare function waitForCertIssuedOnDomains(heroku: APIClient, app: string): Promise<void>;
