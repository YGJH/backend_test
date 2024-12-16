import { APIClient } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
export declare const findRelease: (heroku: APIClient, app: string, search: (releases: Heroku.Release[]) => Heroku.Release) => Promise<Heroku.Release>;
export declare const getRelease: (heroku: APIClient, app: string, release: string) => Promise<Heroku.Release>;
export declare const findByLatestOrId: (heroku: APIClient, app: string, release?: string) => Promise<Heroku.Release>;
export declare const findByPreviousOrId: (heroku: APIClient, app: string, release?: string) => Promise<Heroku.Release>;
