"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const http_call_1 = require("http-call");
const api_1 = require("../../lib/api");
const kolkrabbi_api_1 = require("../../lib/pipelines/kolkrabbi-api");
const PROMOTION_ORDER = ['development', 'staging', 'production'];
async function diff(targetApp, downstreamApp, githubToken, herokuUserAgent) {
    if (!downstreamApp.repo) {
        return core_1.ux.log(`\n${color_1.default.app(targetApp.name)} was not compared to ${color_1.default.app(downstreamApp.name)} as ${color_1.default.app(downstreamApp.name)} is not connected to GitHub`);
    }
    if (downstreamApp.repo !== targetApp.repo) {
        return core_1.ux.log(`\n${color_1.default.app(targetApp.name)} was not compared to ${color_1.default.app(downstreamApp.name)} as ${color_1.default.app(downstreamApp.name)} is not connected to the same GitHub repo as ${color_1.default.app(targetApp.name)}`);
    }
    if (!downstreamApp.hash) {
        return core_1.ux.log(`\n${color_1.default.app(targetApp.name)} was not compared to ${color_1.default.app(downstreamApp.name)} as ${color_1.default.app(downstreamApp.name)} does not have any releases`);
    }
    if (downstreamApp.hash === targetApp.hash) {
        return core_1.ux.log(`\n${color_1.default.app(targetApp.name)} is up to date with ${color_1.default.app(downstreamApp.name)}`);
    }
    // Do the actual GitHub diff
    try {
        const path = `${targetApp.repo}/compare/${downstreamApp.hash}...${targetApp.hash}`;
        const headers = { authorization: 'token ' + githubToken };
        if (herokuUserAgent) {
            headers['user-agent'] = herokuUserAgent;
        }
        const githubDiff = await http_call_1.default.get(`https://api.github.com/repos/${path}`, {
            headers,
        }).then(res => res.body);
        core_1.ux.log('');
        core_1.ux.styledHeader(`${color_1.default.app(targetApp.name)} is ahead of ${color_1.default.app(downstreamApp.name)} by ${githubDiff.ahead_by} commit${githubDiff.ahead_by === 1 ? '' : 's'}`);
        const mapped = githubDiff.commits.map((commit) => {
            return {
                sha: commit.sha.slice(0, 7),
                date: commit.commit.author.date,
                author: commit.commit.author.name,
                message: commit.commit.message.split('\n')[0],
            };
        }).reverse();
        core_1.ux.table(mapped, {
            sha: {
                header: 'SHA',
            },
            date: {},
            author: {},
            message: {},
        });
        core_1.ux.log(`\nhttps://github.com/${path}`);
        // tslint:disable-next-line: no-unused
    }
    catch (_a) {
        core_1.ux.log(`\n${color_1.default.app(targetApp.name)} was not compared to ${color_1.default.app(downstreamApp.name)} because we were unable to perform a diff`);
        core_1.ux.log('are you sure you have pushed your latest commits to GitHub?');
    }
}
class PipelinesDiff extends command_1.Command {
    constructor() {
        super(...arguments);
        this.kolkrabbi = new kolkrabbi_api_1.default(this.config.userAgent, () => this.heroku.auth);
        this.getAppInfo = async (appName, appId, generation) => {
            var _a;
            // Find GitHub connection for the app
            const githubApp = await this.kolkrabbi.getAppLink(appId)
                .catch(() => {
                return { name: appName, repo: null, hash: null };
            });
            // Find the commit hash of the latest release for this app
            let slug;
            let ociImages;
            let commit;
            try {
                const { body: releases } = await (0, api_1.getReleases)(this.heroku, appId);
                const release = releases.find(r => r.status === 'succeeded');
                if (!release || !(release.slug || release.oci_image)) {
                    throw new Error(`no release found for ${appName}`);
                }
                if (generation === 'cedar' && release.slug) {
                    slug = await this.heroku.get(`/apps/${appId}/slugs/${release.slug.id}`, {
                        headers: { Accept: api_1.SDK_HEADER },
                    }).then(res => res.body);
                    commit = slug.commit;
                }
                else if (generation === 'fir' && release.oci_image) {
                    ociImages = await this.heroku.get(`/apps/${appId}/oci-images/${release.oci_image.id}`, {
                        headers: { Accept: api_1.SDK_HEADER },
                    }).then(res => res.body);
                    commit = (_a = ociImages[0]) === null || _a === void 0 ? void 0 : _a.commit;
                }
            }
            catch (_b) {
                return { name: appName, repo: githubApp.repo, hash: undefined };
            }
            return { name: appName, repo: githubApp.repo, hash: commit };
        };
    }
    async run() {
        const { flags } = await this.parse(PipelinesDiff);
        const targetAppName = flags.app;
        const coupling = await (0, api_1.getCoupling)(this.heroku, targetAppName)
            .then(res => res.body)
            .catch(() => { });
        if (!coupling) {
            core_1.ux.error(`This app (${targetAppName}) does not seem to be a part of any pipeline`);
            return;
        }
        const targetAppId = coupling.app.id;
        const generation = coupling.generation;
        core_1.ux.action.start('Fetching apps from pipeline');
        const allApps = await (0, api_1.listPipelineApps)(this.heroku, coupling.pipeline.id);
        core_1.ux.action.stop();
        const sourceStage = coupling.stage;
        if (!sourceStage) {
            return core_1.ux.error(`Unable to diff ${targetAppName}`);
        }
        const downstreamStage = PROMOTION_ORDER[PROMOTION_ORDER.indexOf(sourceStage) + 1];
        if (!downstreamStage || !PROMOTION_ORDER.includes(sourceStage)) {
            return core_1.ux.error(`Unable to diff ${targetAppName}`);
        }
        const downstreamApps = allApps.filter(app => app.pipelineCoupling.stage === downstreamStage);
        if (downstreamApps.length === 0) {
            return core_1.ux.error(`Cannot diff ${targetAppName} as there are no downstream apps configured`);
        }
        // Fetch GitHub repo/latest release hash for [target, downstream[0], .., downstream[n]] apps
        const appInfoPromises = [this.getAppInfo(targetAppName, targetAppId, generation)];
        downstreamApps.forEach(app => {
            if (app.name && app.id) {
                appInfoPromises.push(this.getAppInfo(app.name, app.id, generation));
            }
        });
        core_1.ux.action.start('Fetching release info for all apps');
        const appInfo = await Promise.all(appInfoPromises);
        core_1.ux.action.stop();
        // Verify the target app
        const targetAppInfo = appInfo[0];
        if (!targetAppInfo.repo) {
            const command = `heroku pipelines:open ${coupling.pipeline.name}`;
            return core_1.ux.error(`${targetAppName} does not seem to be connected to GitHub!\nRun ${color_1.default.cyan(command)} and "Connect to GitHub".`);
        }
        if (!targetAppInfo.hash) {
            return core_1.ux.error(`No release was found for ${targetAppName}, unable to diff`);
        }
        // Fetch GitHub token for the user
        const githubAccount = await this.kolkrabbi.getAccount();
        // Diff [{target, downstream[0]}, {target, downstream[1]}, .., {target, downstream[n]}]
        const downstreamAppsInfo = appInfo.slice(1);
        for (const downstreamAppInfo of downstreamAppsInfo) {
            await diff(targetAppInfo, downstreamAppInfo, githubAccount.github.token, this.config.userAgent);
        }
    }
}
exports.default = PipelinesDiff;
PipelinesDiff.description = 'compares the latest release of this app to its downstream app(s)';
PipelinesDiff.examples = [
    '$ heroku pipelines:diff -a my-app-staging',
];
PipelinesDiff.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
