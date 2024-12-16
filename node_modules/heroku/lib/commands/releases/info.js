"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const shellescape = require("shell-escape");
const { forEach } = require('lodash');
const releases_1 = require("../../lib/releases/releases");
const status_helper_1 = require("../../lib/releases/status_helper");
class Info extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags, args } = await this.parse(Info);
        const { json, shell, app } = flags;
        const release = await (0, releases_1.findByLatestOrId)(this.heroku, app, args.release);
        if (json) {
            core_1.ux.styledJSON(release);
        }
        else {
            let releaseChange = release.description;
            const status = (0, status_helper_1.description)(release);
            const statusColor = (0, status_helper_1.color)(release.status);
            const userEmail = (_b = (_a = release === null || release === void 0 ? void 0 : release.user) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : '';
            const { body: config } = await this.heroku.get(`/apps/${app}/releases/${release.version}/config-vars`);
            if (status) {
                releaseChange += ' (' + color_1.default[statusColor](status) + ')';
            }
            core_1.ux.styledHeader(`Release ${color_1.default.cyan('v' + release.version)}`);
            core_1.ux.styledObject({
                'Add-ons': release.addon_plan_names,
                Change: releaseChange,
                By: userEmail,
                'Eligible for Rollback?': release.eligible_for_rollback ? 'Yes' : 'No',
                When: release.created_at,
            });
            core_1.ux.log();
            core_1.ux.styledHeader(`${color_1.default.cyan('v' + release.version)} Config vars`);
            if (shell) {
                forEach(config, (v, k) => {
                    core_1.ux.log(`${k}=${shellescape([v])}`);
                });
            }
            else {
                core_1.ux.styledObject(config);
            }
        }
    }
}
exports.default = Info;
Info.topic = 'releases';
Info.description = 'view detailed information for a release';
Info.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
    shell: command_1.flags.boolean({ char: 's', description: 'output in shell format' }),
    remote: command_1.flags.remote(),
    app: command_1.flags.app({ required: true }),
};
Info.args = {
    release: core_1.Args.string({ description: 'ID of the release. If omitted, we use the last release ID.' }),
};
