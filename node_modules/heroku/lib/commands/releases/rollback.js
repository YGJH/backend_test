"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const releases_1 = require("../../lib/releases/releases");
const output_1 = require("../../lib/releases/output");
class Rollback extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Rollback);
        const { app } = flags;
        const release = await (0, releases_1.findByPreviousOrId)(this.heroku, app, args.release);
        if (!release) {
            core_1.ux.error(`No eligible release found for ${color_1.default.app(app)} to roll back to.`);
        }
        core_1.ux.action.start(`Rolling back ${color_1.default.app(app)} to ${color_1.default.green('v' + release.version)}`);
        const { body: latest } = await this.heroku.post(`/apps/${app}/releases`, {
            body: {
                release: release.id,
            },
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        const streamUrl = latest.output_stream_url;
        core_1.ux.action.stop(`done, ${color_1.default.green('v' + latest.version)}`);
        core_1.ux.warn("Rollback affects code and config vars; it doesn't add or remove addons.");
        if (latest.version) {
            core_1.ux.warn(`To undo, run: ${color_1.default.cyan.bold('heroku rollback v' + (latest.version - 1))}`);
        }
        if (streamUrl) {
            core_1.ux.log('Running release command...');
            await (0, output_1.stream)(streamUrl)
                .catch(error => {
                var _a;
                if (error.statusCode === 404 || ((_a = error.response) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
                    core_1.ux.warn('Release command starting. Use `heroku releases:output` to view the log.');
                    return;
                }
                throw error;
            });
        }
    }
}
exports.default = Rollback;
Rollback.topic = 'releases';
Rollback.hiddenAliases = ['rollback'];
Rollback.description = `Roll back to a previous release.

    If RELEASE is not specified, it will roll back to the last eligible release.
    `;
Rollback.flags = {
    remote: command_1.flags.remote(),
    app: command_1.flags.app({ required: true }),
};
Rollback.args = {
    release: core_1.Args.string({ description: 'ID of the release. If omitted, we use the last eligible release.' }),
};
