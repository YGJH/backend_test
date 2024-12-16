"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
const util = require("util");
const _ = require("lodash");
const filesize_1 = require("filesize");
const { countBy, snakeCase } = _;
function formatDate(date) {
    return date.toISOString();
}
async function getInfo(app, client, extended) {
    const promises = [
        client.heroku.get(`/apps/${app}/addons`),
        client.heroku.request(`/apps/${app}`),
        client.heroku.get(`/apps/${app}/dynos`).catch(() => ({ body: [] })),
        client.heroku.get(`/apps/${app}/collaborators`).catch(() => ({ body: [] })),
        client.heroku.get(`/apps/${app}/pipeline-couplings`).catch(() => ({ body: null })),
    ];
    if (extended) {
        promises.push(client.heroku.get(`/apps/${app}?extended=true`));
    }
    const [{ body: addons }, { body: appWithMoreInfo }, { body: dynos }, { body: collaborators }, { body: pipelineCouplings }, appExtendedResponse,] = await Promise.all(promises);
    const data = {
        addons,
        app: appWithMoreInfo,
        dynos,
        collaborators,
        pipeline_coupling: pipelineCouplings,
    };
    if (appExtendedResponse) {
        data.appExtended = appExtendedResponse.body;
    }
    if (extended) {
        data.appExtended.acm = data.app.acm;
        data.app = data.appExtended;
        delete data.appExtended;
    }
    return data;
}
function print(info, addons, collaborators, extended) {
    const data = {};
    data.Addons = addons;
    data.Collaborators = collaborators;
    if (info.app.archived_at)
        data['Archived At'] = formatDate(new Date(info.app.archived_at));
    if (info.app.cron_finished_at)
        data['Cron Finished At'] = formatDate(new Date(info.app.cron_finished_at));
    if (info.app.cron_next_run)
        data['Cron Next Run'] = formatDate(new Date(info.app.cron_next_run));
    if (info.app.database_size)
        data['Database Size'] = (0, filesize_1.filesize)(info.app.database_size, { standard: 'jedec', round: 0 });
    if (info.app.create_status !== 'complete')
        data['Create Status'] = info.app.create_status;
    if (info.app.space)
        data.Space = info.app.space.name;
    if (info.app.space && info.app.internal_routing)
        data['Internal Routing'] = info.app.internal_routing;
    if (info.pipeline_coupling)
        data.Pipeline = `${info.pipeline_coupling.pipeline.name} - ${info.pipeline_coupling.stage}`;
    data['Auto Cert Mgmt'] = info.app.acm;
    data['Git URL'] = info.app.git_url;
    data['Web URL'] = info.app.web_url;
    data['Repo Size'] = (0, filesize_1.filesize)(info.app.repo_size, { standard: 'jedec', round: 0 });
    if (info.app.generation.name !== 'fir')
        data['Slug Size'] = (0, filesize_1.filesize)(info.app.slug_size, { standard: 'jedec', round: 0 });
    data.Owner = info.app.owner.email;
    data.Region = info.app.region.name;
    data.Dynos = countBy(info.dynos, 'type');
    data.Stack = (function (app) {
        let stack = info.app.stack.name;
        if (app.stack.name !== app.build_stack.name) {
            stack += ` (next build will use ${app.build_stack.name})`;
        }
        return stack;
    })(info.app);
    core_1.ux.styledHeader(info.app.name);
    core_1.ux.styledObject(data);
    if (extended) {
        core_1.ux.log('\n\n--- Extended Information ---\n\n');
        if (info.app.extended) {
            core_1.ux.log(util.inspect(info.app.extended));
        }
    }
}
class AppsInfo extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(AppsInfo);
        const app = args.app || flags.app;
        if (!app)
            throw new Error('No app specified.\nUSAGE: heroku apps:info --app my-app');
        const info = await getInfo(app, this, flags.extended);
        const addons = info.addons.map((a) => { var _a; return (_a = a.plan) === null || _a === void 0 ? void 0 : _a.name; }).sort();
        const collaborators = info.collaborators.map((c) => c.user.email)
            .filter((c) => c !== info.app.owner.email)
            .sort();
        function shell() {
            function print(k, v) {
                core_1.ux.log(`${snakeCase(k)}=${v}`);
            }
            print('auto_cert_mgmt', info.app.acm);
            print('addons', addons);
            print('collaborators', collaborators);
            if (info.app.archived_at)
                print('archived_at', formatDate(new Date(info.app.archived_at)));
            if (info.app.cron_finished_at)
                print('cron_finished_at', formatDate(new Date(info.app.cron_finished_at)));
            if (info.app.cron_next_run)
                print('cron_next_run', formatDate(new Date(info.app.cron_next_run)));
            if (info.app.database_size)
                print('database_size', (0, filesize_1.filesize)(info.app.database_size, { standard: 'jedec', round: 0 }));
            if (info.app.create_status !== 'complete')
                print('create_status', info.app.create_status);
            if (info.pipeline_coupling)
                print('pipeline', `${info.pipeline_coupling.pipeline.name}:${info.pipeline_coupling.stage}`);
            print('git_url', info.app.git_url);
            print('web_url', info.app.web_url);
            print('repo_size', (0, filesize_1.filesize)(info.app.repo_size, { standard: 'jedec', round: 0 }));
            if (info.app.generation.name !== 'fir')
                print('slug_size', (0, filesize_1.filesize)(info.app.slug_size, { standard: 'jedec', round: 0 }));
            print('owner', info.app.owner.email);
            print('region', info.app.region.name);
            print('dynos', util.inspect(countBy(info.dynos, 'type')));
            print('stack', info.app.stack.name);
        }
        if (flags.shell) {
            shell();
        }
        else if (flags.json) {
            core_1.ux.styledJSON(info);
        }
        else {
            print(info, addons, collaborators, flags.extended);
        }
    }
}
exports.default = AppsInfo;
AppsInfo.description = 'show detailed app information';
AppsInfo.topic = 'apps';
AppsInfo.hiddenAliases = ['info'];
AppsInfo.examples = [
    '$ heroku apps:info',
    '$ heroku apps:info --shell',
];
AppsInfo.help = `$ heroku apps:info
=== example
Git URL:   https://git.heroku.com/example.git
Repo Size: 5M
...

$ heroku apps:info --shell
git_url=https://git.heroku.com/example.git
repo_size=5000000
...`;
AppsInfo.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    shell: command_1.flags.boolean({ char: 's', description: 'output more shell friendly key/value pairs' }),
    extended: command_1.flags.boolean({ char: 'x', hidden: true }),
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
};
AppsInfo.args = {
    app: core_1.Args.string({ hidden: true }),
};
