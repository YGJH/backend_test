import { APIClient } from '@heroku-cli/command';
export declare function paginateRequest<T = unknown>(client: APIClient, url: string, pageSize?: number): Promise<T[]>;
