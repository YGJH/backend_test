"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
const lodash_1 = require("lodash");
const api_1 = require("../../lib/api");
const pipelines_1 = require("../../lib/ci/pipelines");
const kolkrabbi_api_1 = require("../../lib/pipelines/kolkrabbi-api");
const dyno_1 = require("../../lib/run/dyno");
const git_1 = require("../../lib/git/git");
const source_1 = require("../../lib/ci/source");
const test_run_1 = require("../../lib/ci/test-run");
// Default command. Run setup, source profile.d scripts and open a bash session
const SETUP_COMMAND = 'ci setup && eval $(ci env)';
class Debug extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags } = await this.parse(Debug);
        const pipeline = await (0, pipelines_1.getPipeline)(flags, this.heroku);
        const kolkrabbi = new kolkrabbi_api_1.default(this.config.userAgent, () => this.heroku.auth);
        const pipelineRepository = await kolkrabbi.getPipelineRepository(pipeline.id);
        const organization = pipelineRepository.organization &&
            pipelineRepository.organization.name;
        const git = new git_1.default();
        const commit = await git.readCommit('HEAD');
        core_1.ux.action.start('Preparing source');
        const sourceBlobUrl = await (0, source_1.createSourceBlob)(commit.ref, this);
        core_1.ux.action.stop();
        // Create test run and wait for it to transition to `debugging`
        core_1.ux.action.start('Creating test run');
        const { body: run } = await (0, api_1.createTestRun)(this.heroku, {
            commit_branch: commit.branch,
            commit_message: commit.message,
            commit_sha: commit.ref,
            debug: true,
            clear_cache: Boolean(flags['no-cache']),
            organization,
            pipeline: pipeline.id,
            source_blob_url: sourceBlobUrl,
        });
        const testRun = await (0, test_run_1.waitForStates)(['debugging', 'errored'], run, this);
        core_1.ux.action.stop();
        if (testRun.status === 'errored') {
            core_1.ux.error(`Test run creation failed while ${testRun.error_state} with message "${testRun.message}"`, { exit: 1 });
        }
        const { body: appSetup } = await (0, api_1.getAppSetup)(this.heroku, (_a = testRun.app_setup) === null || _a === void 0 ? void 0 : _a.id);
        const noSetup = flags['no-setup'];
        core_1.ux.log(`${noSetup ? 'Attaching' : 'Running setup and attaching'} to test dyno...`);
        if (noSetup) {
            core_1.ux.warn('Skipping test setup phase.');
            core_1.ux.warn(`Run \`${SETUP_COMMAND}\``);
            core_1.ux.warn('to execute a build and configure the environment');
        }
        const { body: testNodes } = await (0, api_1.getTestNodes)(this.heroku, testRun.id);
        const dyno = new dyno_1.default({
            heroku: this.heroku,
            app: ((_b = appSetup === null || appSetup === void 0 ? void 0 : appSetup.app) === null || _b === void 0 ? void 0 : _b.id) || '',
            showStatus: false,
            command: '', // command is required, but is not used.
        });
        dyno.dyno = { attach_url: (0, lodash_1.get)(testNodes, [0, 'dyno', 'attach_url']) };
        function sendSetup(data) {
            if (data.toString().includes('$')) {
                dyno.write(SETUP_COMMAND + '\n');
                dyno.removeListener('data', sendSetup);
            }
        }
        if (!noSetup) {
            dyno.on('data', sendSetup);
        }
        try {
            await dyno.attach();
        }
        catch (error) {
            if (error.exitCode)
                this.error(error, { exit: error.exitCode });
            else
                throw error;
        }
        await core_1.ux.action.start('Cleaning up');
        await (0, api_1.updateTestRun)(this.heroku, testRun.id, {
            status: 'cancelled',
            message: 'debug run cancelled by Heroku CLI',
        });
        await core_1.ux.action.stop();
    }
}
exports.default = Debug;
Debug.description = 'opens an interactive test debugging session with the contents of the current directory';
Debug.help = `Example:

    $ heroku ci:debug --pipeline PIPELINE
    Preparing source... done
    Creating test run... done
    Running setup and attaching to test dyno...

~ $
`;
Debug.flags = {
    app: command_1.flags.app(),
    'no-cache': command_1.flags.boolean({ description: 'start test run with an empty cache' }),
    'no-setup': command_1.flags.boolean({ description: 'start test dyno without running test-setup' }),
    pipeline: command_1.flags.pipeline(),
};
Debug.topic = 'ci';
