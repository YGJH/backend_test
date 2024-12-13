"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const fs_extra_1 = require("fs-extra");
const command_1 = require("@heroku-cli/command");
const completions_1 = require("@heroku-cli/command/lib/completions");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const lodash_1 = require("lodash");
const git_1 = require("../../lib/git/git");
const git = new git_1.default();
function createText(name, space) {
    let text = `Creating ${name ? color_1.default.app(name) : 'app'}`;
    if (space) {
        text += ` in space ${space}`;
    }
    return text;
}
async function createApp(context, heroku, name, stack) {
    var _a, _b;
    const { flags } = context;
    const params = {
        name,
        team: flags.team,
        region: flags.region,
        space: flags.space,
        stack,
        internal_routing: flags['internal-routing'],
        feature_flags: flags.features,
        kernel: flags.kernel,
        locked: flags.locked,
    };
    const requestPath = (params.space || params.team) ? '/teams/apps' : '/apps';
    const { body: app } = await heroku.post(requestPath, {
        body: params,
    });
    let status = name ? 'done' : `done, ${color_1.default.app(app.name || '')}`;
    if (flags.region) {
        status += `, region is ${color_1.default.yellow(((_a = app.region) === null || _a === void 0 ? void 0 : _a.name) || '')}`;
    }
    if (stack) {
        status += `, stack is ${color_1.default.yellow(((_b = app.stack) === null || _b === void 0 ? void 0 : _b.name) || '')}`;
    }
    core_1.ux.action.stop(status);
    return app;
}
async function addAddons(heroku, app, addons) {
    for (const addon of addons) {
        const body = {
            plan: addon.plan,
            attachment: addon.as ? { name: addon.as } : undefined,
        };
        core_1.ux.action.start(`Adding ${color_1.default.green(addon.plan)}`);
        await heroku.post(`/apps/${app.name}/addons`, { body });
        core_1.ux.action.stop();
    }
}
async function addConfigVars(heroku, app, configVars) {
    if (Object.keys(configVars).length > 0) {
        core_1.ux.action.start('Setting config vars');
        await heroku.patch(`/apps/${app.name}/config-vars`, {
            body: configVars,
        });
        core_1.ux.action.stop();
    }
}
function addonsFromPlans(plans) {
    return plans.map(plan => ({
        plan: plan.trim(),
    }));
}
async function configureGitRemote(context, app) {
    const remoteUrl = git.httpGitUrl(app.name || '');
    if (!context.flags['no-remote'] && git.inGitRepo()) {
        await git.createRemote(context.flags.remote || 'heroku', remoteUrl);
    }
    return remoteUrl;
}
function printAppSummary(context, app, remoteUrl) {
    if (context.flags.json) {
        core_1.ux.styledJSON(app);
    }
    else {
        core_1.ux.log(`${color_1.default.cyan(app.web_url || '')} | ${color_1.default.green(remoteUrl)}`);
    }
}
async function runFromFlags(context, heroku, config) {
    const { flags, args } = context;
    if (flags['internal-routing'] && !flags.space) {
        throw new Error('Space name required.\nInternal Web Apps are only available for Private Spaces.\nUSAGE: heroku apps:create --space my-space --internal-routing');
    }
    const name = flags.app || args.app || process.env.HEROKU_APP;
    async function addBuildpack(app, buildpack) {
        core_1.ux.action.start(`Setting buildpack to ${color_1.default.cyan(buildpack)}`);
        await heroku.put(`/apps/${app.name}/buildpack-installations`, {
            headers: { Range: '' },
            body: { updates: [{ buildpack: buildpack }] },
        });
        core_1.ux.action.stop();
    }
    core_1.ux.action.start(createText(name, flags.space));
    const app = await createApp(context, heroku, name, flags.stack);
    core_1.ux.action.stop();
    if (flags.addons) {
        const plans = flags.addons.split(',');
        const addons = addonsFromPlans(plans);
        await addAddons(heroku, app, addons);
    }
    if (flags.buildpack) {
        await addBuildpack(app, flags.buildpack);
    }
    const remoteUrl = await configureGitRemote(context, app);
    await config.runHook('recache', { type: 'app', app: app.name });
    printAppSummary(context, app, remoteUrl);
}
async function readManifest() {
    const buffer = await (0, fs_extra_1.readFile)('heroku.yml');
    return yaml.load(buffer.toString(), { filename: 'heroku.yml' });
}
async function runFromManifest(context, heroku) {
    const { flags, args } = context;
    const name = flags.app || args.app || process.env.HEROKU_APP;
    core_1.ux.action.start('Reading heroku.yml manifest');
    const manifest = await readManifest();
    core_1.ux.action.stop();
    core_1.ux.action.start(createText(name, flags.space));
    const app = await createApp(context, heroku, name, 'container');
    core_1.ux.action.stop();
    // _.get used here to avoid type guards when working with `unknown`
    const setup = (0, lodash_1.get)(manifest, 'setup', {});
    const addons = setup.addons || [];
    const configVars = setup.config || {};
    await addAddons(heroku, app, addons);
    await addConfigVars(heroku, app, configVars);
    const remoteUrl = await configureGitRemote(context, app);
    printAppSummary(context, app, remoteUrl);
}
class Create extends command_1.Command {
    async run() {
        const context = await this.parse(Create);
        const { flags } = context;
        if (this.config.channel === 'beta' && flags.manifest) {
            return runFromManifest(context, this.heroku);
        }
        await runFromFlags(context, this.heroku, this.config);
    }
}
exports.default = Create;
Create.description = 'creates a new app';
Create.hiddenAliases = ['create'];
Create.examples = [
    `$ heroku apps:create
Creating app... done, stack is heroku-24
https://floating-dragon-42.heroku.com/ | https://git.heroku.com/floating-dragon-42.git

# or just
$ heroku create

# use a heroku.yml manifest file
$ heroku apps:create --manifest

# specify a buildpack
$ heroku apps:create --buildpack https://github.com/some/buildpack.git

# specify a name
$ heroku apps:create example

# create a staging app
$ heroku apps:create example-staging --remote staging

# create an app in the eu region
$ heroku apps:create --region eu`,
];
Create.args = {
    app: core_1.Args.string({ description: 'name of app to create', required: false }),
};
Create.flags = {
    // `app` set to `flags.string` instead of `flags.app` to maintain original v5 functionality and avoid a default value from the git remote set when used without an app
    app: command_1.flags.string({ hidden: true }),
    addons: command_1.flags.string({ description: 'comma-delimited list of addons to install' }),
    buildpack: command_1.flags.string({
        char: 'b',
        description: 'buildpack url to use for this app',
        completion: completions_1.BuildpackCompletion,
    }),
    manifest: command_1.flags.boolean({ char: 'm', description: 'use heroku.yml settings for this app', hidden: true }),
    'no-remote': command_1.flags.boolean({ char: 'n', description: 'do not create a git remote' }),
    remote: command_1.flags.remote({ description: 'the git remote to create, default "heroku"', default: 'heroku' }),
    stack: command_1.flags.string({ char: 's', description: 'the stack to create the app on', completion: completions_1.StackCompletion }),
    space: command_1.flags.string({ description: 'the private space to create the app in', completion: completions_1.SpaceCompletion }),
    region: command_1.flags.string({ description: 'specify region for the app to run in', completion: completions_1.RegionCompletion }),
    'internal-routing': command_1.flags.boolean({
        hidden: true,
        description: 'private space-only. create as an Internal Web App that is only routable in the local network.',
    }),
    features: command_1.flags.string({ hidden: true }),
    kernel: command_1.flags.string({ hidden: true }),
    locked: command_1.flags.boolean({ hidden: true }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
    team: command_1.flags.team(),
};
