import * as Heroku from '@heroku-cli/schema';
import { APIClient } from '@heroku-cli/command';
export declare const waitForAddonProvisioning: (api: APIClient, addon: Heroku.AddOn, interval: number) => Promise<{
    [x: string]: any;
    actions?: {
        [k: string]: any;
    }[] | undefined;
    addon_service?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    } | undefined;
    billing_entity?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
        type?: "app" | "team" | undefined;
    } | undefined;
    app?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    } | undefined;
    billed_price?: {
        [k: string]: any;
    } | null | undefined;
    config_vars?: string[] | undefined;
    created_at?: string | undefined;
    id?: string | undefined;
    name?: string | undefined;
    plan?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    } | undefined;
    provider_id?: string | undefined;
    state?: "provisioned" | "provisioning" | "deprovisioned" | undefined;
    updated_at?: string | undefined;
    web_url?: string | null | undefined;
}>;
export declare const waitForAddonDeprovisioning: (api: APIClient, addon: Heroku.AddOn, interval: number) => Promise<{
    [x: string]: any;
    actions?: {
        [k: string]: any;
    }[] | undefined;
    addon_service?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    } | undefined;
    billing_entity?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
        type?: "app" | "team" | undefined;
    } | undefined;
    app?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    } | undefined;
    billed_price?: {
        [k: string]: any;
    } | null | undefined;
    config_vars?: string[] | undefined;
    created_at?: string | undefined;
    id?: string | undefined;
    name?: string | undefined;
    plan?: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    } | undefined;
    provider_id?: string | undefined;
    state?: "provisioned" | "provisioning" | "deprovisioned" | undefined;
    updated_at?: string | undefined;
    web_url?: string | null | undefined;
}>;
