"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const open = require("open");
const debug_1 = require("debug");
const api_1 = require("../../lib/api");
const github_api_1 = require("../../lib/pipelines/github-api");
const kolkrabbi_api_1 = require("../../lib/pipelines/kolkrabbi-api");
const create_apps_1 = require("../../lib/pipelines/setup/create-apps");
const get_ci_settings_1 = require("../../lib/pipelines/setup/get-ci-settings");
const get_github_token_1 = require("../../lib/pipelines/setup/get-github-token");
const get_name_and_repo_1 = require("../../lib/pipelines/setup/get-name-and-repo");
const get_repo_1 = require("../../lib/pipelines/setup/get-repo");
const get_settings_1 = require("../../lib/pipelines/setup/get-settings");
const poll_app_setups_1 = require("../../lib/pipelines/setup/poll-app-setups");
const setup_pipeline_1 = require("../../lib/pipelines/setup/setup-pipeline");
const validate_1 = require("../../lib/pipelines/setup/validate");
// eslint-disable-next-line new-cap
const debug = (0, debug_1.default)('pipelines:setup');
class Setup extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Setup);
        const errors = (0, validate_1.nameAndRepo)(args);
        if (errors.length > 0) {
            this.error(errors.join(', '));
            return;
        }
        const kolkrabbi = new kolkrabbi_api_1.default(this.config.userAgent, () => this.heroku.auth);
        const github = new github_api_1.default(this.config.userAgent, await (0, get_github_token_1.default)(kolkrabbi));
        const team = flags.team;
        const { name: pipelineName, repo: repoName } = await (0, get_name_and_repo_1.default)(args);
        const stagingAppName = pipelineName + validate_1.STAGING_APP_INDICATOR;
        const repo = await (0, get_repo_1.default)(github, repoName);
        const settings = await (0, get_settings_1.default)(flags.yes, repo.default_branch);
        const ciSettings = await (0, get_ci_settings_1.default)(flags.yes, team);
        const ownerType = team ? 'team' : 'user';
        // If team or org is not specified, we assign ownership to the user creating
        const { body: { id: ownerID }, } = team ? await (0, api_1.getTeam)(this.heroku, team) : await (0, api_1.getAccountInfo)(this.heroku);
        const owner = { id: ownerID, type: ownerType };
        core_1.ux.action.start('Creating pipeline');
        const { body: pipeline } = await (0, api_1.createPipeline)(this.heroku, pipelineName, owner);
        core_1.ux.action.stop();
        core_1.ux.action.start('Linking to repo');
        await kolkrabbi.createPipelineRepository(pipeline.id, repo.id);
        core_1.ux.action.stop();
        const archiveURL = await kolkrabbi.getArchiveURL(repoName, repo.default_branch);
        const appSetupsResult = await (0, create_apps_1.default)(this.heroku, archiveURL, pipeline, pipelineName, stagingAppName, team);
        const appSetups = appSetupsResult.map((result) => result.body);
        core_1.ux.action.start(`Creating production and staging apps (${color_1.default.app(pipelineName)} and ${color_1.default.app(stagingAppName)})`);
        await (0, poll_app_setups_1.default)(this.heroku, appSetups);
        core_1.ux.action.stop();
        const stagingApp = appSetups.find((appSetup) => appSetup.app.name === stagingAppName).app;
        const setup = (0, setup_pipeline_1.default)(kolkrabbi, stagingApp.id, settings, pipeline.id, ciSettings);
        core_1.ux.action.start('Configuring pipeline');
        try {
            await setup;
            await open(`https://dashboard.heroku.com/pipelines/${pipeline.id}`);
        }
        catch (error) {
            debug(error);
            core_1.ux.error(error);
        }
        finally {
            core_1.ux.action.stop();
        }
    }
}
exports.default = Setup;
Setup.description = 'bootstrap a new pipeline with common settings and create a production and staging app (requires a fully formed app.json in the repo)';
Setup.examples = ['$ heroku pipelines:setup my-pipeline githuborg/reponame -t my-team'];
Setup.flags = {
    team: command_1.flags.team({
        description: 'the team to assign pipeline ownership to (defaults to current user)',
    }),
    yes: command_1.flags.boolean({
        char: 'y',
        description: 'accept all default settings without prompting',
    }),
};
Setup.args = {
    name: core_1.Args.string({
        description: 'name of pipeline',
        required: false,
    }),
    repo: core_1.Args.string({
        description: 'a GitHub repository to connect the pipeline to',
        required: false,
    }),
};
