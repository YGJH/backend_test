/// <reference types="node" />
import type { AddOnAttachment } from '@heroku-cli/schema';
import type { AddOnAttachmentWithConfigVarsAndPlan, CredentialsInfo } from './types';
import { Server } from 'net';
export declare function getConfigVarName(configVars: string[]): string;
export declare const essentialNumPlan: (addon: AddOnAttachmentWithConfigVarsAndPlan) => boolean;
export declare const legacyEssentialPlan: (addon: AddOnAttachmentWithConfigVarsAndPlan) => boolean;
export declare function essentialPlan(addon: AddOnAttachmentWithConfigVarsAndPlan): boolean;
export declare function getConfigVarNameFromAttachment(attachment: Required<AddOnAttachment & {
    addon: AddOnAttachmentWithConfigVarsAndPlan;
}>, config?: Record<string, string>): string;
export declare function presentCredentialAttachments(app: string, credAttachments: Required<AddOnAttachment>[], credentials: CredentialsInfo, cred: string): string;
export declare type ConnectionDetails = {
    user: string;
    password: string;
    database: string;
    host: string;
    port: string;
    pathname: string;
    url: string;
    bastionKey?: string;
    bastionHost?: string;
    _tunnel?: Server;
};
export declare type ConnectionDetailsWithAttachment = ConnectionDetails & {
    attachment: Required<AddOnAttachment & {
        addon: AddOnAttachmentWithConfigVarsAndPlan;
    }>;
};
export declare const getConnectionDetails: (attachment: Required<AddOnAttachment & {
    addon: AddOnAttachmentWithConfigVarsAndPlan;
}>, configVars?: Record<string, string>) => ConnectionDetailsWithAttachment;
export declare const bastionKeyPlan: (a: AddOnAttachmentWithConfigVarsAndPlan) => boolean;
export declare const configVarNamesFromValue: (config: Record<string, string>, value: string) => string[];
export declare const databaseNameFromUrl: (uri: string, config: Record<string, string>) => any;
export declare const parsePostgresConnectionString: (db: string) => ConnectionDetails;
