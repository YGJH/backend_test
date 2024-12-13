import { Command } from '@heroku-cli/command';
export interface SsoParams {
    /**
     * user email address
     */
    email: string;
    /**
     * user ID
     */
    user_id: string;
    /**
     * billing app name
     */
    app: string;
    /**
     * context app name
     */
    context_app: string;
    /**
     * SSO request timestamp
     */
    timestamp: string;
    /**
     * Navigation metadata (deprecated)
     */
    'nav-data': string;
    /**
     * Provider ID (deprecated)
     */
    id: string;
    /**
     * SSO v1 token (deprecated)
     */
    token: string;
    /**
     * Add-on resource ID
     */
    resource_id: string;
    /**
     * SSO v3 token
     */
    resource_token: string;
}
export interface AddonSso {
    /**
     * SSO request method
     */
    method: 'get' | 'post';
    /**
     * URL of the SSO request
     */
    action: string;
    /**
     * SSO params for POST request
     */
    params?: SsoParams;
}
export default class Open extends Command {
    static urlOpener: (url: string) => Promise<unknown>;
    static topic: string;
    static description: string;
    static flags: {
        'show-url': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        app: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        remote: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static args: {
        addon: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    static openUrl(url: string): Promise<void>;
    private parsed;
    run(): Promise<void>;
    private sudo;
    private writeSudoTemplate;
}
