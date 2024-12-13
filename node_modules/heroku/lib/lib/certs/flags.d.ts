import { SniEndpoint } from '../types/sni_endpoint';
import { APIClient } from '@heroku-cli/command';
export default function (flags: {
    endpoint: string | undefined;
    name: string | undefined;
    app: string;
}, heroku: APIClient): Promise<SniEndpoint>;
