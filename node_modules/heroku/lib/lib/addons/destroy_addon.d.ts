import { APIClient } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
export default function (heroku: APIClient, addon: Heroku.AddOn, force?: boolean, wait?: boolean): Promise<Heroku.AddOn>;
