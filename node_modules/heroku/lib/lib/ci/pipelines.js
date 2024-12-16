"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPipeline = exports.disambiguatePipeline = void 0;
const inquirer_1 = require("inquirer");
const validator_1 = require("validator");
const core_1 = require("@oclif/core");
async function disambiguatePipeline(pipelineIDOrName, herokuAPI) {
    const headers = { Accept: 'application/vnd.heroku+json; version=3.pipelines' };
    if ((0, validator_1.isUUID)(pipelineIDOrName)) {
        const { body: pipeline } = await herokuAPI.get(`/pipelines/${pipelineIDOrName}`, { headers });
        return pipeline;
    }
    const { body: pipelines } = await herokuAPI.get(`/pipelines?eq[name]=${pipelineIDOrName}`, { headers });
    let choices;
    let questions;
    switch (pipelines.length) {
        case 0:
            core_1.ux.error('Pipeline not found');
            break;
        case 1:
            return pipelines[0];
        default:
            choices = pipelines.map(function (x) {
                return { name: new Date(x.created_at), value: x };
            });
            questions = [{
                    type: 'list',
                    name: 'pipeline',
                    message: `Which ${pipelineIDOrName} pipeline?`,
                    choices,
                }];
            return (0, inquirer_1.prompt)(questions);
    }
}
exports.disambiguatePipeline = disambiguatePipeline;
async function getPipeline(flags, herokuAPI) {
    let pipeline;
    if ((!flags.pipeline) && (!flags.app)) {
        core_1.ux.error('Required flag:  --pipeline PIPELINE or --app APP');
    }
    if (flags && flags.pipeline) {
        pipeline = await disambiguatePipeline(flags.pipeline, herokuAPI);
        if (pipeline.pipeline) {
            pipeline = pipeline.pipeline;
        } // in case prompt returns an object like { pipeline: { ... } }
    }
    else {
        const { body: coupling } = await herokuAPI.get(`/apps/${flags.app}/pipeline-couplings`);
        if ((coupling) && (coupling.pipeline)) {
            pipeline = coupling.pipeline;
        }
        else {
            core_1.ux.error(`No pipeline found with application ${flags.app}`);
        }
    }
    return pipeline;
}
exports.getPipeline = getPipeline;
