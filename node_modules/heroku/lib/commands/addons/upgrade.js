"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../lib/addons/util");
const resolve_1 = require("../../lib/addons/resolve");
const api_client_1 = require("@heroku-cli/command/lib/api-client");
class Upgrade extends command_1.Command {
    constructor() {
        super(...arguments);
        this.parsed = this.parse(Upgrade);
    }
    async run() {
        var _a, _b;
        const ctx = await this.parsed;
        const { flags: { app }, args } = ctx;
        // called with just one argument in the form of `heroku addons:upgrade heroku-redis:hobby`
        const { addon, plan } = this.getAddonPartsFromArgs(args);
        let resolvedAddon;
        try {
            resolvedAddon = await (0, resolve_1.addonResolver)(this.heroku, app, addon);
        }
        catch (error) {
            if (error instanceof api_client_1.HerokuAPIError && error.http.statusCode === 422 && error.body.id === 'multiple_matches') {
                throw new Error(this.buildApiErrorMessage(error.http.body.message, ctx));
            }
            throw error;
        }
        const { name: addonServiceName } = resolvedAddon.addon_service;
        const { name: appName } = resolvedAddon.app;
        const { name: addonName, plan: resolvedAddonPlan } = resolvedAddon !== null && resolvedAddon !== void 0 ? resolvedAddon : {};
        const updatedPlanName = `${addonServiceName}:${plan}`;
        core_1.ux.action.start(`Changing ${color_1.default.magenta(addonName !== null && addonName !== void 0 ? addonName : '')} on ${color_1.default.cyan(appName !== null && appName !== void 0 ? appName : '')} from ${color_1.default.blue((_a = resolvedAddonPlan === null || resolvedAddonPlan === void 0 ? void 0 : resolvedAddonPlan.name) !== null && _a !== void 0 ? _a : '')} to ${color_1.default.blue(updatedPlanName)}`);
        try {
            const patchResult = await this.heroku.patch(`/apps/${appName}/addons/${addonName}`, {
                body: { plan: { name: updatedPlanName } },
                headers: {
                    'Accept-Expansion': 'plan', 'X-Heroku-Legacy-Provider-Messages': 'true',
                },
            });
            resolvedAddon = patchResult.body;
        }
        catch (error) {
            let errorToThrow = error;
            if (error instanceof api_client_1.HerokuAPIError) {
                const { http } = error;
                if (http.statusCode === 422 &&
                    http.body.message &&
                    http.body.message.startsWith('Couldn\'t find either the add-on')) {
                    const plans = await this.getPlans(addonServiceName);
                    errorToThrow = new Error(`${http.body.message}

Here are the available plans for ${color_1.default.yellow(addonServiceName || '')}:
${plans.map(plan => plan.name).join('\n')}\n\nSee more plan information with ${color_1.default.blue('heroku addons:plans ' + addonServiceName)}

${color_1.default.cyan('https://devcenter.heroku.com/articles/managing-add-ons')}`);
                }
                core_1.ux.action.stop();
                throw errorToThrow;
            }
        }
        core_1.ux.action.stop(`done${((_b = resolvedAddon.plan) === null || _b === void 0 ? void 0 : _b.price) ? `, ${(0, util_1.formatPriceText)(resolvedAddon.plan.price)}` : ''}`);
        if (resolvedAddon.provision_message) {
            core_1.ux.log(resolvedAddon.provision_message);
        }
    }
    getAddonPartsFromArgs(args) {
        let { addon, plan } = args;
        if (!plan && addon.includes(':')) {
            ([addon, plan] = addon.split(':'));
        }
        if (!plan) {
            throw new Error(this.buildNoPlanError(addon));
        }
        // ignore the service part of the plan since we can infer the service based on the add-on
        if (plan.includes(':')) {
            plan = plan.split(':')[1];
        }
        return { plan, addon };
    }
    buildNoPlanError(addon) {
        return `Error: No plan specified.
You need to specify a plan to move ${color_1.default.yellow(addon)} to.
For example: ${color_1.default.blue('heroku addons:upgrade heroku-redis:premium-0')}
${color_1.default.cyan('https://devcenter.heroku.com/articles/managing-add-ons')}`;
    }
    buildApiErrorMessage(errorMessage, ctx) {
        const { flags: { app }, args: { addon, plan } } = ctx;
        const example = errorMessage.split(', ')[2] || 'redis-triangular-1234';
        return `${errorMessage}

Multiple add-ons match ${color_1.default.yellow(addon)}${app ? ' on ' + app : ''}
It is not clear which add-on's plan you are trying to change.

Specify the add-on name instead of the name of the add-on service.
For example, instead of: ${color_1.default.blue('heroku addons:upgrade ' + addon + ' ' + (plan || ''))}
Run this: ${color_1.default.blue('heroku addons:upgrade ' + example + ' ' + addon + ':' + plan)}
${app ? '' : 'Alternatively, specify an app to filter by with ' + color_1.default.blue('--app')}
${color_1.default.cyan('https://devcenter.heroku.com/articles/managing-add-ons')}`;
    }
    async getPlans(addonServiceName) {
        try {
            const plansResponse = await this.heroku.get(`/addon-services/${addonServiceName}/plans`);
            const { body: plans } = plansResponse;
            plans.sort((a, b) => {
                var _a, _b, _c, _d;
                if (((_a = a === null || a === void 0 ? void 0 : a.price) === null || _a === void 0 ? void 0 : _a.cents) === ((_b = b === null || b === void 0 ? void 0 : b.price) === null || _b === void 0 ? void 0 : _b.cents)) {
                    return 0;
                }
                if (!((_c = a === null || a === void 0 ? void 0 : a.price) === null || _c === void 0 ? void 0 : _c.cents) || !((_d = b === null || b === void 0 ? void 0 : b.price) === null || _d === void 0 ? void 0 : _d.cents) || a.price.cents > b.price.cents) {
                    return 1;
                }
                if (a.price.cents < b.price.cents) {
                    return -1;
                }
                return 0;
            });
            return plans;
        }
        catch (_a) {
            return [];
        }
    }
}
exports.default = Upgrade;
Upgrade.aliases = ['addons:downgrade'];
Upgrade.topic = 'addons';
Upgrade.description = `change add-on plan.
  See available plans with \`heroku addons:plans SERVICE\`.

  Note that \`heroku addons:upgrade\` and \`heroku addons:downgrade\` are the same.\
  Either one can be used to change an add-on plan up or down.

  https://devcenter.heroku.com/articles/managing-add-ons
  `;
Upgrade.examples = ['Upgrade an add-on by service name:\n$ heroku addons:upgrade heroku-redis:premium-2\n\nUpgrade a specific add-on:\n$ heroku addons:upgrade swimming-briskly-123 heroku-redis:premium-2'];
Upgrade.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Upgrade.args = {
    addon: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
    plan: core_1.Args.string({ description: 'unique identifier or name of the plan' }),
};
