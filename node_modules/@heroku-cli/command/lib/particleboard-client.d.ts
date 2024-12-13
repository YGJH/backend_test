import { Interfaces } from '@oclif/core';
import { HTTP, HTTPRequestOptions } from 'http-call';
export interface IDelinquencyInfo {
    scheduled_suspension_time?: string | null;
    scheduled_deletion_time?: string | null;
}
export interface IDelinquencyConfig {
    fetch_delinquency: boolean;
    warning_shown: boolean;
    resource_type?: 'account' | 'team';
    fetch_url?: string;
}
export declare class ParticleboardClient {
    protected config: Interfaces.Config;
    http: typeof HTTP;
    private _auth?;
    constructor(config: Interfaces.Config);
    get auth(): string | undefined;
    set auth(token: string | undefined);
    get<T>(url: string, options?: HTTPRequestOptions): Promise<HTTP<T>>;
    get defaults(): typeof HTTP.defaults;
}
