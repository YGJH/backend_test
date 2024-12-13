import { APIClient } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
import { AppWithPipelineCoupling } from '../api';
export declare function warnMixedOwnership(pipelineApps: Array<AppWithPipelineCoupling>, pipeline: Heroku.Pipeline, owner: string): void;
export declare function getOwner(heroku: APIClient, apps: Array<AppWithPipelineCoupling>, pipeline: Heroku.Pipeline): Promise<any>;
