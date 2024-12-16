import * as Heroku from '@heroku-cli/schema';
import { APIClient } from '@heroku-cli/command';
export declare type RedisFormationResponse = {
    addon_id: string;
    name: string;
    plan: string;
    created_at: string;
    formation: {
        id: string;
        primary: string | null;
    };
    metaas_source: string;
    port: number;
    resource_url: string;
    info: {
        name: string;
        values: string[];
    }[];
    version: string;
    prefer_native_tls: boolean;
    customer_encryption_key?: string;
};
declare type RedisEvictionPolicies = 'noeviction' | 'allkeys-lru' | 'volatile-lru' | 'allkeys-random' | 'volatile-random' | 'volatile-ttl' | 'allkeys-lfu' | 'volatile-lfu';
export declare type RedisApiResponse = {
    message: string;
};
export declare type RedisFormationConfigResponse = {
    maxmemory_policy: {
        desc: string;
        value: RedisEvictionPolicies;
        default: RedisEvictionPolicies;
        values: Record<RedisEvictionPolicies, string>;
    };
    notify_keyspace_events: {
        desc: string;
        value: string;
        default: string;
    };
    timeout: {
        desc: string;
        value: number;
        default: number;
    };
    standby_segv_workaround: {
        desc: string;
        value: boolean;
        default: boolean;
    };
};
export declare type RedisMaintenanceWindowResponse = {
    window: string | null;
    scheduled_at?: string;
};
export declare type RedisFormationWaitResponse = {
    message: string;
    'waiting?': boolean;
};
declare type HttpVerb = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
declare const _default: (app: string, database: string | undefined, json: boolean, heroku: APIClient) => {
    request<T>(path: string, method?: HttpVerb, body?: {}): Promise<import("http-call").HTTP<T>>;
    makeAddonsFilter(filter: string | undefined): (addons: Required<Heroku.AddOn>[]) => Required<Heroku.AddOn>[];
    getRedisAddon(addons?: Required<Heroku.AddOn>[]): Promise<Required<Heroku.AddOn>>;
    info(): Promise<void>;
};
export default _default;
