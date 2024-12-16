import * as Heroku from '@heroku-cli/schema';
import { APIClient } from '@heroku-cli/command';
export default function (heroku: APIClient, app: string, plan: string, confirm: string | undefined, wait: boolean, options: {
    name?: string;
    config: Record<string, string | boolean>;
    as?: string;
}): Promise<Heroku.AddOn>;
