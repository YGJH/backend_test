"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const pipelines_1 = require("../../lib/ci/pipelines");
const source_1 = require("../../lib/ci/source");
const test_run_1 = require("../../lib/ci/test-run");
class CiReRun extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(CiReRun);
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        let sourceTestRun;
        if (args.number) {
            const testRunResponse = await this.heroku.get(`/pipelines/${pipeline.id}/test-runs/${args.number}`);
            sourceTestRun = testRunResponse.body;
        }
        else {
            const { body: testRuns } = await this.heroku.get(`/pipelines/${pipeline.id}/test-runs`, { headers: { Range: 'number ..; order=desc,max=1' } });
            sourceTestRun = testRuns[0];
        }
        this.log(`Rerunning test run #${sourceTestRun.number}...`);
        core_1.ux.action.start('Preparing source');
        const sourceBlobUrl = await (0, source_1.createSourceBlob)(sourceTestRun.commit_sha, this);
        core_1.ux.action.stop();
        const { body: pipelineRepository } = await this.heroku.get(`https://kolkrabbi.heroku.com/pipelines/${pipeline.id}/repository`);
        core_1.ux.action.start('Starting test run');
        const organization = pipelineRepository.organization && pipelineRepository.organization.name;
        const { body: testRun } = await this.heroku.post('/test-runs', { body: {
                commit_branch: sourceTestRun.commit_branch,
                commit_message: sourceTestRun.commit_message,
                commit_sha: sourceTestRun.commit_sha,
                pipeline: pipeline.id,
                organization,
                source_blob_url: sourceBlobUrl,
            },
        });
        core_1.ux.action.stop();
        await (0, test_run_1.displayAndExit)(pipeline, testRun.number, this);
    }
}
exports.default = CiReRun;
CiReRun.description = 'rerun tests against current directory';
CiReRun.examples = [
    `$ heroku ci:rerun 985 --app murmuring-headland-14719
`,
];
CiReRun.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    pipeline: command_1.flags.pipeline({ required: false }),
};
CiReRun.args = {
    number: core_1.Args.string({ required: false, description: 'auto-incremented test run number' }),
};
