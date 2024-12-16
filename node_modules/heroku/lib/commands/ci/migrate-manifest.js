"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const fs = require("async-file");
const writeFile = fs.writeFile;
const unlinkFile = fs.unlink;
class CiMigrateManifest extends command_1.Command {
    async run() {
        const appJSONPath = `${process.cwd()}/app.json`;
        const appCiJSONPath = `${process.cwd()}/app-ci.json`;
        let action;
        function showWarning() {
            core_1.ux.log(color_1.default.green('Please check the contents of your app.json before committing to your repo.'));
        }
        async function updateAppJson() {
            // Updating / Creating
            core_1.ux.action.start(`${action.charAt(0).toUpperCase() + action.slice(1)} app.json file`);
            await writeFile(appJSONPath, `${JSON.stringify(appJSON, null, '  ')}\n`);
            core_1.ux.action.stop();
        }
        let appJSON;
        let appCiJSON;
        try {
            appJSON = require(appJSONPath);
            action = 'updating';
        }
        catch (_a) {
            action = 'creating';
            appJSON = {};
        }
        try {
            appCiJSON = require(appCiJSONPath);
        }
        catch (_b) {
            let msg = 'We couldn\'t find an app-ci.json file in the current directory';
            // eslint-disable-next-line no-eq-null, eqeqeq
            if (appJSON.environments == null) {
                msg += `, but we're ${action} ${action === 'updating' ? 'your' : 'a new'} app.json manifest for you.`;
                appJSON.environments = {};
                core_1.ux.log(msg);
                await updateAppJson();
                showWarning();
            }
            else {
                msg += ', and your app.json already has the environments key.';
                core_1.ux.log(msg);
            }
        }
        if (appCiJSON) {
            if (appJSON.environments && appJSON.environments.test) {
                core_1.ux.warn('Your app.json already had a test key. We\'re overwriting it with the content of your app-ci.json');
            }
            // eslint-disable-next-line no-eq-null, eqeqeq
            if (appJSON.environments == null) {
                appJSON.environments = {};
            }
            appJSON.environments.test = appCiJSON;
            await updateAppJson();
            core_1.ux.action.start('Deleting app-ci.json file');
            await unlinkFile(appCiJSONPath);
            core_1.ux.action.stop();
            showWarning();
        }
        core_1.ux.log('You\'re all set! 🎉');
    }
}
exports.default = CiMigrateManifest;
CiMigrateManifest.description = 'app-ci.json is deprecated. Run this command to migrate to app.json with an environments key.';
CiMigrateManifest.topic = 'ci';
CiMigrateManifest.examples = [
    '$ heroku ci:migrate-manifest',
];
