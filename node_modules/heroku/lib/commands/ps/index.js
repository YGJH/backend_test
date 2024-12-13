"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const time_1 = require("../../lib/time");
const tsheredoc_1 = require("tsheredoc");
function getProcessNumber(s) {
    const [processType, dynoNumber] = (s.match(/^([^.]+)\.(.*)$/) || []).slice(1, 3);
    if (!processType || !(dynoNumber === null || dynoNumber === void 0 ? void 0 : dynoNumber.match(/^\d+$/)))
        return 0;
    return Number.parseInt(dynoNumber, 10);
}
function uniqueValues(value, index, self) {
    return self.indexOf(value) === index;
}
function byProcessNumber(a, b) {
    return getProcessNumber(a.name) - getProcessNumber(b.name);
}
function byProcessName(a, b) {
    if (a.name > b.name) {
        return 1;
    }
    if (b.name > a.name) {
        return -1;
    }
    return 0;
}
function byProcessTypeAndNumber(a, b) {
    if (a.type > b.type) {
        return 1;
    }
    if (b.type > a.type) {
        return -1;
    }
    return getProcessNumber(a.name) - getProcessNumber(b.name);
}
function truncate(s) {
    return s.length > 35 ? `${s.slice(0, 34)}…` : s;
}
function printExtended(dynos) {
    const sortedDynos = dynos.sort(byProcessTypeAndNumber);
    core_1.ux.table(sortedDynos, {
        ID: { get: (dyno) => dyno.id },
        Process: { get: (dyno) => dyno.name },
        State: { get: (dyno) => `${dyno.state} ${(0, time_1.ago)(new Date(dyno.updated_at))}` },
        Region: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.region) ? dyno.extended.region : ''; } },
        'Execution Plane': { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.execution_plane) ? dyno.extended.execution_plane : ''; } },
        Fleet: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.fleet) ? dyno.extended.fleet : ''; } },
        Instance: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.instance) ? dyno.extended.instance : ''; } },
        IP: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.ip) ? dyno.extended.ip : ''; } },
        Port: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.port) ? dyno.extended.port.toString() : ''; } },
        AZ: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.az) ? dyno.extended.az : ''; } },
        Release: { get: (dyno) => dyno.release.version },
        Command: { get: (dyno) => truncate(dyno.command) },
        Route: { get: (dyno) => { var _a; return ((_a = dyno.extended) === null || _a === void 0 ? void 0 : _a.route) ? dyno.extended.route : ''; } },
        Size: { get: (dyno) => dyno.size },
    }, {
        'no-truncate': true,
    });
}
async function printAccountQuota(heroku, app, account) {
    if (app.process_tier !== 'free' && app.process_tier !== 'eco') {
        return;
    }
    if (app.owner.id !== account.id) {
        return;
    }
    const { body: quota } = await heroku.request(`/accounts/${account.id}/actions/get-quota`, { headers: { Accept: 'application/vnd.heroku+json; version=3.account-quotas' } }).catch(() => {
        return { body: null };
    });
    if (!quota || (quota.id && quota.id === 'not_found')) {
        return;
    }
    const remaining = (quota.account_quota === 0) ? 0 : quota.account_quota - quota.quota_used;
    const percentage = (quota.account_quota === 0) ? 0 : Math.floor(remaining / quota.account_quota * 100);
    const remainingMinutes = remaining / 60;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = Math.floor(remainingMinutes % 60);
    const appQuota = quota.apps.find(appQuota => {
        return appQuota.app_uuid === app.id;
    });
    const appQuotaUsed = appQuota ? appQuota.quota_used / 60 : 0;
    const appPercentage = appQuota ? Math.floor(appQuota.quota_used * 100 / quota.account_quota) : 0;
    const appHours = Math.floor(appQuotaUsed / 60);
    const appMinutes = Math.floor(appQuotaUsed % 60);
    if (app.process_tier === 'eco') {
        core_1.ux.log(`Eco dyno hours quota remaining this month: ${hours}h ${minutes}m (${percentage}%)`);
        core_1.ux.log(`Eco dyno usage for this app: ${appHours}h ${appMinutes}m (${appPercentage}%)`);
        core_1.ux.log('For more information on Eco dyno hours, see:');
        core_1.ux.log('https://devcenter.heroku.com/articles/eco-dyno-hours');
        core_1.ux.log();
    }
    if (app.process_tier === 'free') {
        core_1.ux.log(`Free dyno hours quota remaining this month: ${hours}h ${minutes}m (${percentage}%)`);
        core_1.ux.log(`Free dyno usage for this app: ${appHours}h ${appMinutes}m (${appPercentage}%)`);
        core_1.ux.log('For more information on dyno sleeping and how to upgrade, see:');
        core_1.ux.log('https://devcenter.heroku.com/articles/dyno-sleeping');
        core_1.ux.log();
    }
}
function decorateOneOffDyno(dyno) {
    const since = (0, time_1.ago)(new Date(dyno.updated_at));
    // eslint-disable-next-line unicorn/explicit-length-check
    const size = dyno.size || '1X';
    const state = dyno.state === 'up' ? color_1.default.green(dyno.state) : color_1.default.yellow(dyno.state);
    return `${dyno.name} (${color_1.default.cyan(size)}): ${state} ${color_1.default.dim(since)}: ${dyno.command}`;
}
function decorateCommandDyno(dyno) {
    const since = (0, time_1.ago)(new Date(dyno.updated_at));
    const state = dyno.state === 'up' ? color_1.default.green(dyno.state) : color_1.default.yellow(dyno.state);
    return `${dyno.name}: ${state} ${color_1.default.dim(since)}`;
}
function printDynos(dynos) {
    const oneOffs = dynos.filter(d => d.type === 'run').sort(byProcessNumber);
    const commands = dynos.filter(d => d.type !== 'run').map(d => d.command).filter(uniqueValues);
    // Print one-off dynos
    if (oneOffs.length > 0) {
        core_1.ux.styledHeader(`${color_1.default.green('run')}: one-off processes (${color_1.default.yellow(oneOffs.length.toString())})`);
        oneOffs.forEach(dyno => core_1.ux.log(decorateOneOffDyno(dyno)));
        core_1.ux.log();
    }
    // Print dynos grouped by command
    commands.forEach(function (command) {
        const commandDynos = dynos.filter(d => d.command === command).sort(byProcessNumber);
        const type = commandDynos[0].type;
        // eslint-disable-next-line unicorn/explicit-length-check
        const size = commandDynos[0].size || '1X';
        core_1.ux.styledHeader(`${color_1.default.green(type)} (${color_1.default.cyan(size)}): ${command} (${color_1.default.yellow(commandDynos.length.toString())})`);
        for (const dyno of commandDynos)
            core_1.ux.log(decorateCommandDyno(dyno));
        core_1.ux.log();
    });
}
class Index extends command_1.Command {
    async run() {
        const _a = await this.parse(Index), { flags } = _a, restParse = tslib_1.__rest(_a, ["flags"]);
        const { app, json, extended } = flags;
        const types = restParse.argv;
        const suffix = extended ? '?extended=true' : '';
        const promises = {
            dynos: this.heroku.request(`/apps/${app}/dynos${suffix}`, {
                headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
            }),
            appInfo: this.heroku.request(`/apps/${app}`, {
                headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
            }),
            accountInfo: this.heroku.request('/account', {
                headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
            }),
        };
        const [{ body: dynos }, { body: appInfo }, { body: accountInfo }] = await Promise.all([promises.dynos, promises.appInfo, promises.accountInfo]);
        const shielded = appInfo.space && appInfo.space.shield;
        if (shielded) {
            dynos.forEach(d => {
                d.size = d.size.replace('Private-', 'Shield-');
            });
        }
        let selectedDynos = dynos;
        if (types.length > 0) {
            selectedDynos = selectedDynos.filter(dyno => types.find((t) => dyno.type === t));
            types.forEach(t => {
                if (!selectedDynos.some(d => d.type === t)) {
                    throw new Error(`No ${color_1.default.cyan(t)} dynos on ${color_1.default.magenta(app)}`);
                }
            });
        }
        selectedDynos = selectedDynos.sort(byProcessName);
        if (json)
            core_1.ux.styledJSON(selectedDynos);
        else if (extended)
            printExtended(selectedDynos);
        else {
            await printAccountQuota(this.heroku, appInfo, accountInfo);
            if (selectedDynos.length === 0)
                core_1.ux.log(`No dynos on ${color_1.default.magenta(app)}`);
            else
                printDynos(selectedDynos);
        }
    }
}
exports.default = Index;
Index.topic = 'ps';
Index.description = 'list dynos for an app';
Index.strict = false;
Index.usage = 'ps [TYPE [TYPE ...]]';
Index.examples = [(0, tsheredoc_1.default) `
    $ heroku ps
    === run: one-off dyno
    run.1: up for 5m: bash
    === web: bundle exec thin start -p $PORT
    web.1: created for 30s
  `, (0, tsheredoc_1.default) `
    $ heroku ps run # specifying types
    === run: one-off dyno
    run.1: up for 5m: bash
  `];
Index.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ description: 'display as json' }),
    extended: command_1.flags.boolean({ char: 'x', hidden: true }), // only works with sudo privileges
};
