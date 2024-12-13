import { APIClient } from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
import { App, PipelineCoupling, Release } from './types/fir';
export declare const V3_HEADER = "application/vnd.heroku+json; version=3";
export declare const SDK_HEADER = "application/vnd.heroku+json; version=3.sdk";
export declare const FILTERS_HEADER: string;
export declare const PIPELINES_HEADER: string;
export declare function createAppSetup(heroku: APIClient, body: {
    body: any;
}): Promise<import("http-call").HTTP<Heroku.AppSetup>>;
export declare function postCoupling(heroku: APIClient, pipeline: any, app: any, stage: string): Promise<import("http-call").HTTP<unknown>>;
export declare function createCoupling(heroku: APIClient, pipeline: any, app: string, stage: string): Promise<import("http-call").HTTP<unknown>>;
export declare function createPipeline(heroku: APIClient, name: any, owner: any): Promise<import("http-call").HTTP<Heroku.Pipeline>>;
export declare function createPipelineTransfer(heroku: APIClient, pipeline: Heroku.Pipeline): Promise<import("http-call").HTTP<unknown>>;
export declare function destroyPipeline(heroku: APIClient, name: any, pipelineId: any): Promise<import("http-call").HTTP<unknown>>;
export declare function findPipelineByName(heroku: APIClient, idOrName: string): Promise<import("http-call").HTTP<Heroku.Pipeline[]>>;
export interface PipelineCouplingSdk extends Required<PipelineCoupling> {
    generation: 'fir' | 'cedar';
}
export declare function getCoupling(heroku: APIClient, app: string): Promise<import("http-call").HTTP<PipelineCouplingSdk>>;
export declare function getPipeline(heroku: APIClient, id: string): Promise<import("http-call").HTTP<Heroku.Pipeline>>;
export declare function updatePipeline(heroku: APIClient, id: string, body: Heroku.Pipeline): Promise<import("http-call").HTTP<Heroku.Pipeline>>;
export declare function getTeam(heroku: APIClient, teamId: any): Promise<import("http-call").HTTP<Heroku.Team>>;
export declare function getAccountInfo(heroku: APIClient, id?: string): Promise<import("http-call").HTTP<Heroku.Account>>;
export declare function getAppSetup(heroku: APIClient, buildId: any): Promise<import("http-call").HTTP<Heroku.AppSetup>>;
export interface AppWithPipelineCoupling extends App {
    pipelineCoupling: PipelineCouplingSdk;
    [k: string]: unknown;
}
export declare function listPipelineApps(heroku: APIClient, pipelineId: string): Promise<Array<AppWithPipelineCoupling>>;
export declare function patchCoupling(heroku: APIClient, id: string, stage: string): Promise<import("http-call").HTTP<Heroku.PipelineCoupling>>;
export declare function removeCoupling(heroku: APIClient, app: string): Promise<import("http-call").HTTP<unknown>>;
export declare function updateCoupling(heroku: APIClient, app: string, stage: string): Promise<import("http-call").HTTP<Heroku.PipelineCoupling>>;
export declare function getReleases(heroku: APIClient, appId: string): Promise<import("http-call").HTTP<Release[]>>;
export declare function getPipelineConfigVars(heroku: APIClient, pipelineID: string): Promise<import("http-call").HTTP<Heroku.ConfigVars>>;
export declare function setPipelineConfigVars(heroku: APIClient, pipelineID: string, body: Heroku.ConfigVars | Record<string, null>): Promise<import("http-call").HTTP<Heroku.ConfigVars>>;
export declare function createTestRun(heroku: APIClient, body: Heroku.TestRun): Promise<import("http-call").HTTP<Heroku.TestRun>>;
export declare function getTestNodes(heroku: APIClient, testRunIdD: string): Promise<import("http-call").HTTP<Heroku.TestRun>>;
export declare function updateTestRun(heroku: APIClient, id: string, body: Heroku.TestRun): Promise<import("http-call").HTTP<Heroku.TestRun>>;
