import { APIClient } from '@heroku-cli/command';
import type { AddOnAttachment } from '@heroku-cli/schema';
import * as Heroku from '@heroku-cli/schema';
import type { AddOnAttachmentWithConfigVarsAndPlan, AddOnWithRelatedData } from './types';
export declare function arbitraryAppDB(heroku: APIClient, app: string): Promise<Heroku.AddOn>;
export declare function all(heroku: APIClient, app_id: string): Promise<AddOnWithRelatedData[]>;
export declare function getAttachment(heroku: APIClient, app: string, db?: string, namespace?: string): Promise<Required<AddOnAttachment & {
    addon: AddOnAttachmentWithConfigVarsAndPlan;
}>>;
export declare function getAddon(heroku: APIClient, app: string, db?: string): Promise<{
    id: string;
    name: string;
    app: {
        [k: string]: any;
        id?: string | undefined;
        name?: string | undefined;
    };
} & Required<AddOnAttachment> & {
    config_vars: string[] | undefined;
    addon: Required<{
        id: string;
        name: string;
        app: {
            [k: string]: any;
            id?: string | undefined;
            name?: string | undefined;
        };
    }> & {
        attachment_names?: string[] | undefined;
        links?: import("./types").Link[] | undefined;
        plan: Required<{
            [k: string]: any;
            id?: string | undefined;
            name?: string | undefined;
        } | undefined>;
    };
}>;
export declare function database(heroku: APIClient, app: string, db?: string, namespace?: string): Promise<import("./util").ConnectionDetailsWithAttachment>;
export declare function getRelease(heroku: APIClient, appName: string, id: string): Promise<Heroku.Release>;
