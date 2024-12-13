import { APIClient } from '@heroku-cli/command';
interface LogDisplayerOptions {
    app: string;
    dyno?: string;
    lines?: number;
    source?: string;
    tail: boolean;
    type?: string;
}
declare function logDisplayer(heroku: APIClient, options: LogDisplayerOptions): Promise<void>;
export default logDisplayer;
