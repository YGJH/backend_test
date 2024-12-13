"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const releases_1 = require("../../lib/releases/releases");
const output_1 = require("../../lib/releases/output");
class Output extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Output);
        const { app } = flags;
        const release = await (0, releases_1.findByLatestOrId)(this.heroku, app, args.release);
        const streamUrl = release.output_stream_url;
        if (!streamUrl) {
            core_1.ux.warn(`Release v${release.version} has no release output available.`);
            return;
        }
        await (0, output_1.stream)(streamUrl)
            .catch(error => {
            var _a;
            if (error.statusCode === 404 || ((_a = error.response) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
                core_1.ux.warn('Release command not started yet. Please try again in a few seconds.');
                return;
            }
            throw error;
        });
    }
}
exports.default = Output;
Output.topic = 'releases';
Output.description = 'View the release command output';
Output.flags = {
    remote: command_1.flags.remote(),
    app: command_1.flags.app({ required: true }),
};
Output.args = {
    release: core_1.Args.string({ description: 'ID of the release. If omitted, we use the last release ID.' }),
};
