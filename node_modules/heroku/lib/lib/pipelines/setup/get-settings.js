"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const DEFAULT_SETTINGS = {
    auto_deploy: true,
    wait_for_ci: true,
    pull_requests: {
        enabled: true,
        auto_deploy: true,
        auto_destroy: true,
    },
};
async function getSettings(yes, branch) {
    if (yes) {
        return DEFAULT_SETTINGS;
    }
    const settings = {
        auto_deploy: true,
        wait_for_ci: true,
        pull_requests: {
            enabled: true,
            auto_deploy: true,
            auto_destroy: true,
        },
    };
    settings.auto_deploy = await core_1.ux.confirm(`Automatically deploy the ${branch} branch to staging?`);
    if (settings.auto_deploy) {
        settings.wait_for_ci = await core_1.ux.confirm(`Wait for CI to pass before deploying the ${branch} branch to staging?`);
    }
    settings.pull_requests.enabled = await core_1.ux.confirm('Enable review apps?');
    if (settings.pull_requests.enabled) {
        settings.pull_requests.auto_deploy = await core_1.ux.confirm('Automatically create review apps for every PR?');
    }
    if (settings.pull_requests.enabled) {
        settings.pull_requests.auto_destroy = await core_1.ux.confirm('Automatically destroy idle review apps after 5 days?');
    }
    return settings;
}
exports.default = getSettings;
