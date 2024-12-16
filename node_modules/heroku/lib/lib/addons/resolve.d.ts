import { APIClient } from '@heroku-cli/command';
import type { AddOnAttachment } from '@heroku-cli/schema';
import type { AddOnAttachmentWithConfigVarsAndPlan } from '../pg/types';
export declare const appAddon: (heroku: APIClient, app: string, id: string, options?: AddOnAttachment) => Promise<AddOnAttachmentWithConfigVarsAndPlan>;
export declare const addonResolver: (heroku: APIClient, app: string | undefined, id: string, options?: AddOnAttachment) => Promise<AddOnAttachmentWithConfigVarsAndPlan>;
export declare const appAttachment: (heroku: APIClient, app: string | undefined, id: string, options?: {
    addon_service?: string;
    namespace?: string;
}) => Promise<AddOnAttachment & {
    addon: AddOnAttachmentWithConfigVarsAndPlan;
}>;
export declare const attachmentResolver: (heroku: APIClient, app: string | undefined, id: string, options?: {
    addon_service?: string;
    namespace?: string;
}) => Promise<void | AddOnAttachment>;
export declare function resolveAddon(...args: Parameters<typeof addonResolver>): ReturnType<typeof addonResolver>;
export declare namespace resolveAddon {
    var cache: Map<string, Promise<AddOnAttachmentWithConfigVarsAndPlan>>;
}
export declare class NotFound extends Error {
    readonly statusCode = 404;
    readonly id = "not_found";
    readonly message = "Couldn't find that addon.";
}
export declare class AmbiguousError extends Error {
    readonly matches: {
        name?: string;
    }[];
    readonly type: string;
    readonly statusCode = 422;
    readonly message: string;
    readonly body: {
        id: string;
        message: string;
    };
    constructor(matches: {
        name?: string;
    }[], type: string);
}
