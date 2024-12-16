import { APIClient } from '@heroku-cli/command';
import { Domain } from '../types/domain';
export declare function waitForDomains(app: string, heroku: APIClient): Promise<Domain[]>;
