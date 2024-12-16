"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAttachment = void 0;
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../lib/addons/util");
const lodash_1 = require("lodash");
const printf = require('printf');
const topic = 'addons';
async function addonGetter(api, app) {
    let attachmentsResponse = null;
    let addonsResponse;
    if (app) { // don't display attachments globally
        addonsResponse = api.get(`/apps/${app}/addons`, {
            headers: {
                'Accept-Expansion': 'addon_service,plan',
            },
        });
        const sudoHeaders = JSON.parse(process.env.HEROKU_HEADERS || '{}');
        if (sudoHeaders['X-Heroku-Sudo'] && !sudoHeaders['X-Heroku-Sudo-User']) {
            // because the root /addon-attachments endpoint won't include relevant
            // attachments when sudo-ing for another app, we will use the more
            // specific API call and sacrifice listing foreign attachments.
            attachmentsResponse = api.get(`/apps/${app}/addon-attachments`);
        }
        else {
            // In order to display all foreign attachments, we'll get out entire
            // attachment list
            attachmentsResponse = api.get('/addon-attachments');
        }
    }
    else {
        addonsResponse = api.get('/addons', {
            headers: {
                'Accept-Expansion': 'addon_service,plan',
            },
        });
    }
    // Get addons and attachments in parallel
    const [{ body: addonsRaw }, potentialAttachments] = await Promise.all([addonsResponse, attachmentsResponse]);
    function isRelevantToApp(addon) {
        var _a;
        return !app || ((_a = addon.app) === null || _a === void 0 ? void 0 : _a.name) === app || (0, lodash_1.some)(addon.attachments, att => att.app.name === app);
    }
    const groupedAttachments = (0, lodash_1.groupBy)(potentialAttachments === null || potentialAttachments === void 0 ? void 0 : potentialAttachments.body, 'addon.id');
    const addons = [];
    addonsRaw.forEach(function (addon) {
        addon.attachments = groupedAttachments[addon.id] || [];
        delete groupedAttachments[addon.id];
        if (isRelevantToApp(addon)) {
            addons.push(addon);
        }
        if (addon.plan) {
            addon.plan.price = (0, util_1.grandfatheredPrice)(addon);
        }
    });
    // Any attachments left didn't have a corresponding add-on record in API.
    // This is probably normal (because we are asking API for all attachments)
    // but it could also be due to certain types of permissions issues, so check
    // if the attachment looks relevant to the app, and then render whatever
    (0, lodash_1.values)(groupedAttachments)
        .forEach(function (atts) {
        const inaccessibleAddon = {
            app: atts[0].addon.app, name: atts[0].addon.name, addon_service: {}, plan: {}, attachments: atts,
        };
        if (isRelevantToApp(inaccessibleAddon)) {
            addons.push(inaccessibleAddon);
        }
    });
    return addons;
}
function displayAll(addons) {
    addons = (0, lodash_1.sortBy)(addons, 'app.name', 'plan.name', 'addon.name');
    if (addons.length === 0) {
        core_1.ux.log('No add-ons.');
        return;
    }
    core_1.ux.table(addons, {
        'Owning App': {
            get: ({ app }) => color_1.default.cyan((app === null || app === void 0 ? void 0 : app.name) || ''),
        },
        'Add-on': {
            get: ({ name }) => color_1.default.magenta(name || ''),
        },
        Plan: {
            get: function ({ plan }) {
                if (typeof plan === 'undefined')
                    return color_1.default.dim('?');
                return plan.name;
            },
        },
        Price: {
            get: function ({ plan }) {
                if (typeof (plan === null || plan === void 0 ? void 0 : plan.price) === 'undefined')
                    return color_1.default.dim('?');
                return (0, util_1.formatPrice)({ price: plan === null || plan === void 0 ? void 0 : plan.price, hourly: true });
            },
        },
        'Max Price': {
            get: function ({ plan }) {
                if (typeof (plan === null || plan === void 0 ? void 0 : plan.price) === 'undefined')
                    return color_1.default.dim('?');
                return (0, util_1.formatPrice)({ price: plan === null || plan === void 0 ? void 0 : plan.price, hourly: false });
            },
        },
        State: {
            get: function ({ state }) {
                let result = state || '';
                switch (state) {
                    case 'provisioned':
                        result = 'created';
                        break;
                    case 'provisioning':
                        result = 'creating';
                        break;
                    case 'deprovisioned':
                        result = 'errored';
                }
                return result;
            },
        },
    });
}
function formatAttachment(attachment, showApp = true) {
    var _a;
    const attName = color_1.default.green(attachment.name || '');
    const output = [color_1.default.dim('as'), attName];
    if (showApp) {
        const appInfo = `on ${color_1.default.cyan(((_a = attachment.app) === null || _a === void 0 ? void 0 : _a.name) || '')} app`;
        output.push(color_1.default.dim(appInfo));
    }
    return output.join(' ');
}
function renderAttachment(attachment, app, isFirst = false) {
    var _a;
    const line = isFirst ? '\u2514\u2500' : '\u251C\u2500';
    const attName = formatAttachment(attachment, ((_a = attachment.app) === null || _a === void 0 ? void 0 : _a.name) !== app);
    return printf(' %s %s', color_1.default.dim(line), attName);
}
exports.renderAttachment = renderAttachment;
function displayForApp(app, addons) {
    if (addons.length === 0) {
        core_1.ux.log(`No add-ons for app ${app}.`);
        return;
    }
    const isForeignApp = (attOrAddon) => { var _a; return ((_a = attOrAddon.app) === null || _a === void 0 ? void 0 : _a.name) !== app; };
    function presentAddon(addon) {
        var _a;
        const name = color_1.default.magenta(addon.name || '');
        let service = (_a = addon.addon_service) === null || _a === void 0 ? void 0 : _a.name;
        if (service === undefined) {
            service = color_1.default.dim('?');
        }
        const addonLine = `${service} (${name})`;
        const atts = (0, lodash_1.sortBy)(addon.attachments, isForeignApp, 'app.name', 'name');
        // render each attachment under the add-on
        const attLines = atts.map(function (attachment, idx) {
            const isFirst = (idx === addon.attachments.length - 1);
            return renderAttachment(attachment, app, isFirst);
        });
        return [addonLine].concat(attLines)
            .join('\n') + '\n'; // Separate each add-on row by a blank line
    }
    addons = (0, lodash_1.sortBy)(addons, isForeignApp, 'plan.name', 'name');
    core_1.ux.log();
    core_1.ux.table(addons, {
        'Add-on': { get: presentAddon },
        Plan: {
            get: ({ plan }) => plan && plan.name !== undefined ?
                plan.name.replace(/^[^:]+:/, '') :
                color_1.default.dim('?'),
        },
        Price: {
            get: function (addon) {
                var _a, _b, _c;
                if (((_a = addon.app) === null || _a === void 0 ? void 0 : _a.name) === app) {
                    return (0, util_1.formatPrice)({ price: (_b = addon.plan) === null || _b === void 0 ? void 0 : _b.price, hourly: true });
                }
                return color_1.default.dim(printf('(billed to %s app)', color_1.default.cyan(((_c = addon.app) === null || _c === void 0 ? void 0 : _c.name) || '')));
            },
        },
        'Max Price': {
            get: function (addon) {
                var _a, _b, _c;
                if (((_a = addon.app) === null || _a === void 0 ? void 0 : _a.name) === app) {
                    return (0, util_1.formatPrice)({ price: (_b = addon.plan) === null || _b === void 0 ? void 0 : _b.price, hourly: false });
                }
                return color_1.default.dim(printf('(billed to %s app)', color_1.default.cyan(((_c = addon.app) === null || _c === void 0 ? void 0 : _c.name) || '')));
            },
        },
        State: {
            get: ({ state }) => (0, util_1.formatState)(state || ''),
        },
    }, {
    // Separate each add-on row by a blank line
    // printLine: (s: string) => {
    //   ux.log(s)
    //   ux.log('\n')
    // },
    });
    core_1.ux.log(`The table above shows ${color_1.default.magenta('add-ons')} and the ${color_1.default.green('attachments')} to the current app (${app}) or other ${color_1.default.cyan('apps')}.\n  `);
}
function displayJSON(addons) {
    core_1.ux.log(JSON.stringify(addons, null, 2));
}
class Addons extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Addons);
        const { app, all, json } = flags;
        if (!all && app) {
            const addons = await addonGetter(this.heroku, app);
            if (json)
                displayJSON(addons);
            else
                displayForApp(app, addons);
        }
        else {
            const addons = await addonGetter(this.heroku);
            if (json)
                displayJSON(addons);
            else
                displayAll(addons);
        }
    }
}
exports.default = Addons;
Addons.topic = topic;
Addons.usage = 'addons [--all|--app APP]';
Addons.description = `Lists your add-ons and attachments.

  The default filter applied depends on whether you are in a Heroku app
  directory. If so, the --app flag is implied. If not, the default of --all
  is implied. Explicitly providing either flag overrides the default
  behavior.
  `;
Addons.flags = {
    all: command_1.flags.boolean({ char: 'A', description: 'show add-ons and attachments for all accessible apps' }),
    json: command_1.flags.boolean({ description: 'return add-ons in json format' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Addons.examples = [
    `$ heroku ${topic} --all`,
    `$ heroku ${topic} --app acme-inc-www`,
];
