import * as Heroku from '@heroku-cli/schema';
export default function createApps(heroku: any, archiveURL: any, pipeline: any, pipelineName: any, stagingAppName: any, organization: any): Promise<void | import("http-call").HTTP<Heroku.AppSetup>[]>;
