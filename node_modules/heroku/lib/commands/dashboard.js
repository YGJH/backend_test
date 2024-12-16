"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const img = require("term-img");
const path = require("path");
const child_process_1 = require("child_process");
const sparkline = require('sparkline');
const time_1 = require("../lib/time");
const process = require("process");
const empty = (o) => Object.keys(o).length === 0;
function displayFormation(formation) {
    formation = (0, lodash_1.groupBy)(formation, 'size');
    formation = (0, lodash_1.map)(formation, (p, size) => `${bold((0, lodash_1.sumBy)(p, 'quantity').toString())} | ${size}`);
    core_1.ux.log(`  ${label('Dynos:')} ${formation.join(', ')}`);
}
function displayErrors(metrics) {
    let errors = [];
    if (metrics.routerErrors) {
        errors = errors.concat(Object.entries(metrics.routerErrors.data)
            .map(e => color_1.default.red(`${(0, lodash_1.sum)(e[1])} ${e[0]}`)));
    }
    if (metrics.dynoErrors) {
        metrics.dynoErrors.filter(d => d)
            .forEach(dynoErrors => {
            errors = errors.concat(Object.entries((dynoErrors === null || dynoErrors === void 0 ? void 0 : dynoErrors.data) || {})
                .map(e => color_1.default.red(`${(0, lodash_1.sum)(e[1])} ${e[0]}`)));
        });
    }
    if (errors.length > 0)
        core_1.ux.log(`  ${label('Errors:')} ${errors.join(dim(', '))} (see details with ${color_1.default.cyan.bold('heroku apps:errors')})`);
}
function displayMetrics(metrics) {
    function rpmSparkline() {
        var _a;
        if (['win32', 'windows'].includes(process.platform))
            return '';
        const points = [];
        Object.values(((_a = metrics.routerStatus) === null || _a === void 0 ? void 0 : _a.data) || {})
            .forEach(cur => {
            for (const [i, element] of cur.entries()) {
                const j = Math.floor(i / 3);
                points[j] = (points[j] || 0) + element;
            }
        });
        points.pop();
        return dim(sparkline(points)) + ' last 24 hours rpm';
    }
    let ms = '';
    let rpm = '';
    if (metrics.routerLatency && !empty(metrics.routerLatency.data)) {
        const latency = metrics.routerLatency.data['latency.ms.p50'];
        if (!empty(latency))
            ms = `${(0, lodash_1.round)((0, lodash_1.mean)(latency))} ms `;
    }
    if (metrics.routerStatus && !empty(metrics.routerStatus.data)) {
        rpm = `${(0, lodash_1.round)((0, lodash_1.sum)((0, lodash_1.flatten)(Object.values(metrics.routerStatus.data))) / 24 / 60)} rpm ${rpmSparkline()}`;
    }
    if (rpm || ms)
        core_1.ux.log(`  ${label('Metrics:')} ${ms}${rpm}`);
}
function displayNotifications(notifications) {
    if (!notifications)
        return;
    notifications = notifications.filter(n => !n.read);
    if (notifications.length > 0) {
        core_1.ux.log(`\nYou have ${color_1.default.yellow(notifications.length.toString())} unread notifications. Read them with ${color_1.default.cyan.bold('heroku notifications')}`);
    }
}
const dim = (s) => color_1.default.dim(s);
const bold = (s) => color_1.default.bold(s);
const label = (s) => color_1.default.blue(s);
const fetchMetrics = async (apps, heroku) => {
    const NOW = new Date().toISOString();
    const YESTERDAY = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();
    const date = `start_time=${YESTERDAY}&end_time=${NOW}&step=1h`;
    const metricsData = await Promise.all(apps.map(app => {
        const types = app.formation.map((p) => p.type);
        const dynoErrorsPromise = Promise.all(types.map((type) => heroku.get(`/apps/${app.app.name}/formation/${type}/metrics/errors?${date}`, { hostname: 'api.metrics.herokai.com' }).catch(() => { })));
        return Promise.all([
            dynoErrorsPromise,
            heroku.get(`/apps/${app.app.name}/router-metrics/latency?${date}&process_type=${types[0]}`, { hostname: 'api.metrics.herokai.com' }).catch(() => { }),
            heroku.get(`/apps/${app.app.name}/router-metrics/errors?${date}&process_type=${types[0]}`, { hostname: 'api.metrics.herokai.com' }).catch(() => { }),
            heroku.get(`/apps/${app.app.name}/router-metrics/status?${date}&process_type=${types[0]}`, { hostname: 'api.metrics.herokai.com' }).catch(() => { }),
        ]);
    }));
    return metricsData.map(([dynoErrors, routerLatency, routerErrors, routerStatus]) => ({
        dynoErrors, routerLatency: routerLatency === null || routerLatency === void 0 ? void 0 : routerLatency.body, routerErrors: routerErrors === null || routerErrors === void 0 ? void 0 : routerErrors.body, routerStatus: routerStatus === null || routerStatus === void 0 ? void 0 : routerStatus.body,
    }));
};
function displayApps(apps, appsMetrics) {
    var _a;
    const getOwner = (owner) => { var _a; return ((_a = owner === null || owner === void 0 ? void 0 : owner.email) === null || _a === void 0 ? void 0 : _a.endsWith('@herokumanager.com')) ? owner.email.split('@')[0] : owner === null || owner === void 0 ? void 0 : owner.email; };
    const zipped = (0, lodash_1.zip)(apps, appsMetrics);
    for (const a of zipped) {
        const app = a[0];
        const metrics = a[1];
        core_1.ux.log(color_1.default.magenta(app.app.name || ''));
        core_1.ux.log(`  ${label('Owner:')} ${getOwner(app.app.owner)}`);
        if (app.pipeline) {
            core_1.ux.log(`  ${label('Pipeline:')} ${(_a = app.pipeline.pipeline) === null || _a === void 0 ? void 0 : _a.name}`);
        }
        displayFormation(app.formation);
        core_1.ux.log(`  ${label('Last release:')} ${(0, time_1.ago)(new Date(app.app.released_at || ''))}`);
        displayMetrics(metrics);
        displayErrors(metrics);
        core_1.ux.log();
    }
}
class Dashboard extends command_1.Command {
    async run() {
        if (!this.heroku.auth && process.env.IS_HEROKU_TEST_ENV !== 'true') {
            (0, child_process_1.execSync)('heroku help', { stdio: 'inherit' });
            return;
        }
        const favoriteApps = async () => {
            const { body: apps } = await this.heroku.get('/favorites?type=app', {
                hostname: 'particleboard.heroku.com',
            });
            return apps.map(app => app.resource_name);
        };
        try {
            img(path.join(__dirname, '..', '..', 'assets', 'heroku.png'), { fallback: () => { } });
        }
        catch (_a) { }
        core_1.ux.action.start('Loading');
        const apps = await favoriteApps();
        const [{ body: teams }, notificationsResponse, appsWithMoreInfo] = await Promise.all([
            this.heroku.get('/teams'),
            this.heroku.get('/user/notifications', { hostname: 'telex.heroku.com' })
                .catch(() => null),
            Promise.all(apps.map(async (appID) => {
                const [{ body: app }, { body: formation }, pipelineResponse] = await Promise.all([
                    this.heroku.get(`/apps/${appID}`),
                    this.heroku.get(`/apps/${appID}/formation`),
                    this.heroku.get(`/apps/${appID}/pipeline-couplings`)
                        .catch(() => null),
                ]);
                return {
                    app, formation, pipeline: pipelineResponse === null || pipelineResponse === void 0 ? void 0 : pipelineResponse.body,
                };
            })),
        ]);
        const metrics = await fetchMetrics(appsWithMoreInfo, this.heroku);
        core_1.ux.action.stop();
        if (apps.length > 0)
            displayApps(appsWithMoreInfo, metrics);
        else
            core_1.ux.warn(`Add apps to this dashboard by favoriting them with ${color_1.default.cyan.bold('heroku apps:favorites:add')}`);
        core_1.ux.log(`See all add-ons with ${color_1.default.cyan.bold('heroku addons')}`);
        const sampleTeam = (0, lodash_1.sortBy)(teams.filter(o => o.role !== 'collaborator'), o => new Date(o.created_at || ''))[0];
        if (sampleTeam)
            core_1.ux.log(`See all apps in ${color_1.default.yellow.dim(sampleTeam.name || '')} with ${color_1.default.cyan.bold('heroku apps --team ' + sampleTeam.name)}`);
        core_1.ux.log(`See all apps with ${color_1.default.cyan.bold('heroku apps --all')}`);
        displayNotifications(notificationsResponse === null || notificationsResponse === void 0 ? void 0 : notificationsResponse.body);
        core_1.ux.log(`\nSee other CLI commands with ${color_1.default.cyan.bold('heroku help')}\n`);
    }
}
exports.default = Dashboard;
Dashboard.topic = 'dashboard';
Dashboard.description = 'display information about favorite apps';
Dashboard.hidden = true;
