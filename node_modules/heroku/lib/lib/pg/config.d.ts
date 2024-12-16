import type { APIClient } from '@heroku-cli/command';
export declare function getConfig(heroku: APIClient, app: string): Promise<Record<string, string> | undefined>;
