import { APIClient } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
import { AppWithPipelineCoupling } from '../api';
export default function renderPipeline(heroku: APIClient, pipeline: Heroku.Pipeline, pipelineApps: Array<AppWithPipelineCoupling>, { withOwners, showOwnerWarning }?: {
    withOwners: boolean;
    showOwnerWarning: boolean;
}): Promise<void>;
